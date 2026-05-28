import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Share2, Wallet } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center px-4 space-y-12">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Split Bills, <span className="text-primary">Without the Hassle.</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Create a bill, share the link, and track who's paid. No apps to install, no accounts for
          participants.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/create">
            <Button size="lg" className="px-8 text-lg h-14">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="px-8 text-lg h-14">
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full">
        <FeatureCard
          icon={Wallet}
          title="Easy Creation"
          description="Add participants and amounts in seconds. We handle the math."
        />
        <FeatureCard
          icon={Share2}
          title="Frictionless Sharing"
          description="Send a simple link via WhatsApp. No participant accounts needed."
        />
        <FeatureCard
          icon={CheckCircle2}
          title="Real-time Tracking"
          description="Watch your dashboard update as friends confirm their payments."
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 border rounded-2xl space-y-3 text-left hover:border-primary transition-colors">
      <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
