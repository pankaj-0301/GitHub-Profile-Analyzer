import { useState } from 'react';
import { GithubIcon, Search, Loader2, GitForkIcon, StarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { BarChart } from '@/components/ui/chart';

interface Repository {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  language: string;
  html_url: string;
  created_at: string;
  forks_count: number;
}

interface MonthlyStats {
  commits: number;
  repositories: number;
  stars: number;
  forks: number;
}

interface MonthlyData {
  month: string;
  commits: number;
  repositories: number;
  stars: number;
  forks: number;
}

function App() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const { toast } = useToast();

  const fetchAllRepositories = async (username: string): Promise<Repository[]> => {
    let page = 1;
    let allRepos: Repository[] = [];
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&page=${page}`
      );
      if (!response.ok) throw new Error('Failed to fetch repositories');
      
      const repos = await response.json();
      if (repos.length === 0) {
        hasMore = false;
      } else {
        allRepos = [...allRepos, ...repos];
        page++;
      }
    }

    return allRepos;
  };

  const getMonthName = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  const processMonthlyData = (repos: Repository[], events: any[]): MonthlyData[] => {
    const monthlyStats = new Map<string, MonthlyStats>();
    const now = new Date();
    const monthsAgo = new Date(now.setMonth(now.getMonth() - 11));

    // Initialize last 12 months
    for (let d = new Date(monthsAgo); d <= new Date(); d.setMonth(d.getMonth() + 1)) {
      const monthKey = getMonthName(new Date(d));
      monthlyStats.set(monthKey, { commits: 0, repositories: 0, stars: 0, forks: 0 });
    }

    // Process repository data
    repos.forEach(repo => {
      const createdDate = new Date(repo.created_at);
      const monthKey = getMonthName(createdDate);
      
      if (monthlyStats.has(monthKey)) {
        const stats = monthlyStats.get(monthKey)!;
        stats.repositories += 1;
        stats.stars += repo.stargazers_count;
        stats.forks += repo.forks_count;
      }
    });

    // Process commit data
    events
      .filter((event: any) => event.type === 'PushEvent')
      .forEach((event: any) => {
        const date = new Date(event.created_at);
        const monthKey = getMonthName(date);
        
        if (monthlyStats.has(monthKey)) {
          const stats = monthlyStats.get(monthKey)!;
          stats.commits += event.payload.size;
        }
      });

    // Convert to array and sort by date
    return Array.from(monthlyStats.entries())
      .map(([month, stats]) => ({
        month,
        ...stats,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  const fetchGitHubData = async () => {
    if (!username) {
      toast({
        title: 'Error',
        description: 'Please enter a GitHub username',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch all repositories
      const reposData = await fetchAllRepositories(username);
      setRepos(reposData);

      // Fetch user events for commit data
      const eventsResponse = await fetch(
        `https://api.github.com/users/${username}/events/public`
      );
      const eventsData = await eventsResponse.json();
      
      // Process monthly statistics
      const monthlyStats = processMonthlyData(reposData, eventsData);
      setMonthlyData(monthlyStats);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch GitHub data. Please check the username.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-center space-x-2">
          <GithubIcon className="w-8 h-8" />
          <h1 className="text-3xl font-bold">GitHub Profile Analyzer</h1>
        </div>

        <div className="flex space-x-2">
          <Input
            placeholder="Enter GitHub username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchGitHubData()}
          />
          <Button onClick={fetchGitHubData} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity Analysis (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Commit Activity</h3>
                  <BarChart
                    data={monthlyData}
                    categories={['commits']}
                    index="month"
                    colors={['chart-1']}
                    valueFormatter={(value) => `${value} commits`}
                    className="h-64"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">New Repositories</h3>
                  <BarChart
                    data={monthlyData}
                    categories={['repositories']}
                    index="month"
                    colors={['chart-2']}
                    valueFormatter={(value) => `${value} repos`}
                    className="h-64"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Stars and Forks</h3>
                  <BarChart
                    data={monthlyData}
                    categories={['stars', 'forks']}
                    index="month"
                    colors={['chart-3', 'chart-4']}
                    valueFormatter={(value) => `${value}`}
                    className="h-64"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {repos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Public Repositories ({repos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repos.map((repo) => (
                  <div key={repo.id}>
                    <div className="flex items-center justify-between">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold hover:underline"
                      >
                        {repo.name}
                      </a>
                      <div className="flex items-center space-x-4">
                        {repo.language && (
                          <span className="text-sm text-muted-foreground">
                            {repo.language}
                          </span>
                        )}
                        <div className="flex items-center space-x-2">
                          <StarIcon className="w-4 h-4" />
                          <span className="text-sm">{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GitForkIcon className="w-4 h-4" />
                          <span className="text-sm">{repo.forks_count}</span>
                        </div>
                      </div>
                    </div>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {repo.description}
                      </p>
                    )}
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;