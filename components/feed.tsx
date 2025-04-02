// components/feed.tsx
"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MessageCircle } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

interface Post {
  id: number
  userId: string
  userName: string
  content: string
  timestamp: number // Using timestamp for sorting
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userNames, setUserNames] = useState<Map<string, string>>(new Map())

  // Function to fetch all posts
  const fetchPosts = async () => {
    try {
      // Fetch all users if we don't have them yet
      if (userNames.size === 0) {
        const usersResponse = await fetch('http://20.244.56.144/evaluation-service/users')
        const usersData = await usersResponse.json()
        
        const newUserNames = new Map<string, string>()
        
        // Store user names
        for (const [id, name] of Object.entries(usersData.users)) {
          newUserNames.set(id, name as string)
        }
        
        setUserNames(newUserNames)
      }
      
      // Fetch posts for each user
      const userIds = Array.from(userNames.keys())
      const allPosts: Post[] = []
      
      for (const userId of userIds) {
        const postsResponse = await fetch(`http://20.244.56.144/evaluation-service/users/${userId}/posts`)
        const postsData = await postsResponse.json()
        
        postsData.posts.forEach((post: any) => {
          allPosts.push({
            id: post.id,
            userId,
            userName: userNames.get(userId) || '',
            content: post.content,
            timestamp: Date.now() - Math.random() * 1000000 // Simulating timestamps for sorting
          })
        })
      }
      
      // Sort posts by timestamp (newest first)
      allPosts.sort((a, b) => b.timestamp - a.timestamp)
      
      setPosts(allPosts)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
    
    // Set up polling for real-time updates
    const intervalId = setInterval(() => {
      fetchPosts()
    }, 10000) // Poll every 10 seconds
    
    return () => clearInterval(intervalId)
  }, [userNames.size])

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-40 w-full mt-4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-[100px]" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={`${post.id}-${post.timestamp}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={`https://source.unsplash.com/random/100x100?face&${post.userId}`} />
                <AvatarFallback>{post.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="font-medium">{post.userName}</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg">{post.content}</div>
            <div className="mt-4 aspect-video rounded-md overflow-hidden">
              <img 
                src={`https://source.unsplash.com/random/800x450?${post.content.split(' ').pop()?.toLowerCase()}`} 
                alt="Post image" 
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center text-muted-foreground">
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>Comments</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}