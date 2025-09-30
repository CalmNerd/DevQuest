'use client'

import { LoginWithPermissions } from '@/components/auth'
import { useSearchParams } from 'next/navigation'

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to DevQuest</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Choose your access level
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            We respect your privacy. Select the access level you're comfortable with. 
            You can always upgrade later if you want access to private repository statistics.
          </p>
        </div>

        {/* Login Options */}
        <LoginWithPermissions returnUrl={returnUrl} />

        {/* FAQ Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-card p-4 rounded-lg border">
              <summary className="font-medium cursor-pointer">
                Why do you need GitHub access?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                We need access to your GitHub profile to track your contributions, 
                repositories, and display you on leaderboards. This helps gamify your 
                developer journey and motivates you to keep building!
              </p>
            </details>

            <details className="bg-card p-4 rounded-lg border">
              <summary className="font-medium cursor-pointer">
                What's the difference between Basic and Enhanced access?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                <strong>Basic Access</strong> only sees your public profile and repositories. 
                <strong>Enhanced Access</strong> can also see your private repositories, 
                giving you more accurate statistics if you work on private projects.
              </p>
            </details>

            <details className="bg-card p-4 rounded-lg border">
              <summary className="font-medium cursor-pointer">
                Will you modify my repositories?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                <strong>No, never!</strong> We only request read-only access. We cannot and 
                will not create, modify, or delete any of your repositories or code.
              </p>
            </details>

            <details className="bg-card p-4 rounded-lg border">
              <summary className="font-medium cursor-pointer">
                Can I change my access level later?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Yes! You can revoke permissions at any time through your GitHub settings 
                at <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  github.com/settings/applications
                </a>. To upgrade access, simply log in again and choose Enhanced Access.
              </p>
            </details>

            <details className="bg-card p-4 rounded-lg border">
              <summary className="font-medium cursor-pointer">
                How is my data stored?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Your GitHub access token is encrypted using AES-256-GCM encryption before 
                being stored in our database. We follow security best practices to protect 
                your data.
              </p>
            </details>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-12 p-6 bg-muted rounded-lg max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <h3 className="font-medium mb-1">Your Privacy Matters</h3>
              <p className="text-sm text-muted-foreground">
                We're committed to transparency and your privacy. We only request the 
                minimum permissions needed for our features, and we never sell or share 
                your data with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
