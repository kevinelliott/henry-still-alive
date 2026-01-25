import { NextRequest, NextResponse } from 'next/server'

type HealthStatus = 'alive' | 'slowing' | 'dead'

function calculateStatus(daysSincePublish: number, daysSinceCommit: number | null): HealthStatus {
  // Use the more recent of publish or commit date
  const daysInactive = daysSinceCommit !== null 
    ? Math.min(daysSincePublish, daysSinceCommit)
    : daysSincePublish

  if (daysInactive <= 90) return 'alive'      // Active in last 3 months
  if (daysInactive <= 365) return 'slowing'   // Active in last year
  return 'dead'                                // No activity in 1+ year
}

function extractGitHubUrl(repository: any): string | null {
  if (!repository) return null
  
  let url = typeof repository === 'string' ? repository : repository.url
  if (!url) return null
  
  // Clean up the URL
  url = url.replace(/^git\+/, '')
            .replace(/\.git$/, '')
            .replace(/^git:\/\//, 'https://')
            .replace(/^ssh:\/\/git@github\.com/, 'https://github.com')
            .replace(/^git@github\.com:/, 'https://github.com/')
  
  if (url.includes('github.com')) {
    return url
  }
  
  return null
}

function parseGitHubPath(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const packageName = searchParams.get('package')

  if (!packageName) {
    return NextResponse.json({ error: 'Package name is required' }, { status: 400 })
  }

  try {
    // Fetch from npm registry
    const npmRes = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!npmRes.ok) {
      if (npmRes.status === 404) {
        return NextResponse.json({ error: `Package "${packageName}" not found on npm` }, { status: 404 })
      }
      throw new Error(`npm registry returned ${npmRes.status}`)
    }

    const npmData = await npmRes.json()
    
    // Get latest version info
    const latestVersion = npmData['dist-tags']?.latest
    const latestInfo = npmData.versions?.[latestVersion] || {}
    
    // Calculate days since last publish
    const lastPublishDate = npmData.time?.[latestVersion] || npmData.time?.modified
    const daysSincePublish = lastPublishDate 
      ? Math.floor((Date.now() - new Date(lastPublishDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    // Get download counts
    let weeklyDownloads = 0
    try {
      const downloadsRes = await fetch(
        `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`
      )
      if (downloadsRes.ok) {
        const downloadsData = await downloadsRes.json()
        weeklyDownloads = downloadsData.downloads || 0
      }
    } catch (e) {
      // Ignore download count errors
    }

    // Try to get GitHub info
    const repoUrl = extractGitHubUrl(latestInfo.repository || npmData.repository)
    let lastCommit: string | null = null
    let daysSinceCommit: number | null = null
    let openIssues = -1

    if (repoUrl) {
      const ghPath = parseGitHubPath(repoUrl)
      if (ghPath) {
        try {
          // Get repo info for open issues
          const repoRes = await fetch(
            `https://api.github.com/repos/${ghPath.owner}/${ghPath.repo}`,
            { 
              headers: { 'Accept': 'application/vnd.github.v3+json' },
              next: { revalidate: 3600 }
            }
          )
          if (repoRes.ok) {
            const repoData = await repoRes.json()
            openIssues = repoData.open_issues_count || 0
          }

          // Get last commit
          const commitsRes = await fetch(
            `https://api.github.com/repos/${ghPath.owner}/${ghPath.repo}/commits?per_page=1`,
            { 
              headers: { 'Accept': 'application/vnd.github.v3+json' },
              next: { revalidate: 3600 }
            }
          )
          if (commitsRes.ok) {
            const commits = await commitsRes.json()
            if (commits.length > 0) {
              lastCommit = commits[0].commit?.author?.date || commits[0].commit?.committer?.date
              if (lastCommit) {
                daysSinceCommit = Math.floor(
                  (Date.now() - new Date(lastCommit).getTime()) / (1000 * 60 * 60 * 24)
                )
              }
            }
          }
        } catch (e) {
          // Ignore GitHub errors, we still have npm data
        }
      }
    }

    const status = calculateStatus(daysSincePublish, daysSinceCommit)

    return NextResponse.json({
      name: npmData.name,
      version: latestVersion,
      description: npmData.description || '',
      lastPublish: lastPublishDate,
      daysSincePublish,
      weeklyDownloads,
      openIssues,
      lastCommit,
      daysSinceCommit,
      status,
      repoUrl,
      npmUrl: `https://www.npmjs.com/package/${encodeURIComponent(packageName)}`,
      maintainers: (npmData.maintainers || []).map((m: any) => m.name || m).slice(0, 5),
    })

  } catch (error) {
    console.error('Error checking package:', error)
    return NextResponse.json(
      { error: 'Failed to check package. Please try again.' },
      { status: 500 }
    )
  }
}
