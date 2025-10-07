import type React from "react";
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Calendar, Users, Code } from "lucide-react";

interface GSoCLayoutProps {
  children: React.ReactNode;
}

export default function GSoCLayout({ children }: GSoCLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Google Summer of Code</h1>
              <p className="text-muted-foreground mt-1">
                Explore organizations, projects, and contributions from 2009 to present
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Years</span>
                </div>
                <p className="text-2xl font-bold mt-1">15+</p>
                <p className="text-xs text-muted-foreground">2009 - Present</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Organizations</span>
                </div>
                <p className="text-2xl font-bold mt-1">200+</p>
                <p className="text-xs text-muted-foreground">Open Source</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Projects</span>
                </div>
                <p className="text-2xl font-bold mt-1">1000+</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Students</span>
                </div>
                <p className="text-2xl font-bold mt-1">1000+</p>
                <p className="text-xs text-muted-foreground">Contributors</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
