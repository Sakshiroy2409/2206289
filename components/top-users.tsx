// components/top-users.tsx
"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  name: string
  postCount: number
}

export default function TopUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        // Fetch all users
        const usersResponse = await fetch('http://20.244.56.144/evaluation-service/users')
        const usersData = await usersResponse.json()
        
        // Create a map to store user post counts
        const userPostCounts = new Map<string, number>()
        const userNames = new Map<string, string>()
        
        // Store user names
        for (const [id, name] of Object.entries(usersData.users)) {
          userNames.set(id, name as string)
          userPostCounts.set(id, 0)
        }
        
        // Fetch post counts for each user (in parallel)
        const userIds = Object.keys(usersData.users)
        const postCountPromises = userIds.map(async (userId) => {
          const postsResponse = await fetch(`http://20.244.56.144/evaluation-service/users/${userId}/posts`)
          const postsData = await postsResponse.json()
          return { userId, count: postsData.posts.length }
        })
        
        const postCounts = await Promise.all(postCountPromises)
        
        // Update post counts
        postCounts.forEach(({ userId, count }) => {
          userPostCounts.set(userId, count)
        })
        
        // Convert to array and sort by post count
        const topUsers = Array.from(userPostCounts.entries())
          .map(([id, postCount]) => ({
            id,
            name: userNames.get(id) || '',
            postCount
          }))
          .sort((a, b) => b.postCount - a.postCount)
          .slice(0, 5) // Get top 5
        
        setUsers(topUsers)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching top users:', error)
        setLoading(false)
      }
    }

    fetchTopUsers()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={`https://source.unsplash.com/random/100x100?face&${user.id}`} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.postCount} posts</div>
              </div>
              <div className="ml-auto font-bold text-xl">#{users.indexOf(user) + 1}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}