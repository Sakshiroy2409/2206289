// app/page.tsx
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TopUsers from "@/components/top-users"
import TrendingPosts from "@/components/trending-posts"
import Feed from "@/components/feed"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Social Media Analytics Dashboard</h1>
      
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="trending">Trending Posts</TabsTrigger>
          <TabsTrigger value="users">Top Users</TabsTrigger>
        </TabsList>
        <TabsContent value="feed">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Feed</CardTitle>
              <CardDescription>
                Latest posts from all users, updated in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Feed />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle>Trending Posts</CardTitle>
              <CardDescription>
                Posts with the most comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendingPosts />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Top Users</CardTitle>
              <CardDescription>
                Users with the most posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TopUsers />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}