import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export default function Help() {
  const helpTopics = [
    {
      title: "Getting Started",
      description: "Learn the basics of using TallyPrime Clone",
      link: "#"
    },
    {
      title: "Creating Vouchers",
      description: "How to create different types of vouchers",
      link: "#"
    },
    {
      title: "Managing Ledgers",
      description: "Guide to creating and managing ledgers",
      link: "#"
    },
    {
      title: "Inventory Management",
      description: "Tracking stock items and reorder alerts",
      link: "#"
    },
    {
      title: "Generating Reports",
      description: "How to generate and export financial reports",
      link: "#"
    },
    {
      title: "GST Compliance",
      description: "Filing GST returns and compliance",
      link: "#"
    }
  ]

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Help & Support</h1>
        <p className="text-muted-foreground mb-6">Find answers to common questions and get support</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Email Support</h3>
                <p className="text-sm text-muted-foreground">support@tallyprimeclone.com</p>
              </div>
              <div>
                <h3 className="font-medium">Phone Support</h3>
                <p className="text-sm text-muted-foreground">+91 98765 43210</p>
              </div>
              <div>
                <h3 className="font-medium">Business Hours</h3>
                <p className="text-sm text-muted-foreground">Monday - Friday, 9:00 AM - 6:00 PM IST</p>
              </div>
              <Button className="w-full">Send Message</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">User Manual</h3>
                <p className="text-sm text-muted-foreground mb-2">Complete guide to all features</p>
                <Button variant="outline" className="w-full">
                  Download PDF <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div>
                <h3 className="font-medium">Video Tutorials</h3>
                <p className="text-sm text-muted-foreground mb-2">Step-by-step video guides</p>
                <Button variant="outline" className="w-full">
                  Watch Videos <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {helpTopics.map((topic, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{topic.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{topic.description}</p>
                <Button variant="outline" size="sm">
                  View Guide <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}