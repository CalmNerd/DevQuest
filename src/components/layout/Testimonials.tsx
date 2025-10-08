import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui'
import { Quote, Star } from 'lucide-react'

interface Testimonial {
  name: string
  role: string
  company: string
  avatar: string
  content: string
  rating: number
}

const Testimonials = () => {
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Chen",
      role: "Full Stack Developer",
      company: "TechCorp",
      avatar: "/placeholder.png",
      content: "DevQuest transformed how I track my GitHub contributions. The gamification aspect motivates me to code more consistently, and the leaderboards create healthy competition among my team.",
      rating: 5
    },
    {
      name: "Alex Rodriguez",
      role: "Open Source Maintainer",
      company: "Independent",
      avatar: "/placeholder.png",
      content: "The achievement badges and trending developer features are game-changers! I've discovered so many talented developers and trending repositories through this platform.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Software Engineer",
      company: "StartupXYZ",
      avatar: "/placeholder.png",
      content: "Love the GSoC organizations browser and issue explorer. It's made contributing to open source so much easier. The repository discovery feature helped me find perfect projects to contribute to.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Team Lead",
      company: "DevStudios",
      avatar: "/placeholder.png",
      content: "We use DevQuest for our entire engineering team. The detailed analytics and contribution graphs give us great insights into productivity and help recognize top performers.",
      rating: 5
    },
    {
      name: "Emily Wang",
      role: "CS Student",
      company: "MIT",
      avatar: "/placeholder.png",
      content: "As a student, DevQuest helps me track my learning progress and compare my contributions with peers. The achievement system makes coding feel like an RPG game!",
      rating: 5
    },
    {
      name: "David Kim",
      role: "Senior Developer",
      company: "CloudTech",
      avatar: "/placeholder.png",
      content: "The type-safe backend and real-time leaderboards are incredibly well-built. As a developer, I appreciate the attention to detail and clean architecture.",
      rating: 5
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Loved by Developers Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers who are already gamifying their GitHub experience
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={`${testimonial.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="h-8 w-8 text-primary/40" />
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <p className="text-muted-foreground mb-6 line-clamp-4">
                    "{testimonial.content}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full border-2 border-border object-cover"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} @ {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials

