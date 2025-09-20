import { Card, CardContent } from "../ui"
import { Button } from '../ui'
import { Github } from "lucide-react"

const CTA = () => {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4 text-center">
                <Card className="mx-auto max-w-2xl bg-gradient-to-br from-primary/10 to-accent/10">
                    <CardContent className="p-12">
                        <h2 className="mb-4 text-3xl font-bold">Ready to Rank Up?</h2>
                        <p className="mb-8 text-lg text-muted-foreground">
                            Join thousands of developers who are already gamifying their GitHub experience
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Button size="lg" className="animate-glow">
                                <Github className="mr-2 h-5 w-5" />
                                Get Started Free
                            </Button>
                            <Button size="lg" variant="outline">
                                View Demo Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}

export default CTA