'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, TrendingUp, Users, Zap, UserPlus, Megaphone } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Loyalty Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered platform to automate member enrollment, manage loyalty programs, and optimize program costs
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/register')}>
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Users className="w-12 h-12 text-blue-600 mb-2" />
              <CardTitle>Member Management</CardTitle>
              <CardDescription>
                Automate enrollment and manage member profiles with ease
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <UserPlus className="w-12 h-12 text-indigo-600 mb-2" />
              <CardTitle>Member Enrollment</CardTitle>
              <CardDescription>
                Automated member registration with profile management and tier assignment
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Gift className="w-12 h-12 text-green-600 mb-2" />
              <CardTitle>Loyalty Costs</CardTitle>
              <CardDescription>
                Define redemption options, rewards catalog, and point costs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-12 h-12 text-purple-600 mb-2" />
              <CardTitle>Rules Engine</CardTitle>
              <CardDescription>
                Configure earning rules, tier conditions, and point accrual logic
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-orange-600 mb-2" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Cost analysis, redemption patterns, and ROI metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-teal-600 mb-2" />
              <CardTitle>Accrual Management</CardTitle>
              <CardDescription>
                Track and manage points accrual from customer transactions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Megaphone className="w-12 h-12 text-pink-600 mb-2" />
              <CardTitle>Loyalty Campaign Management</CardTitle>
              <CardDescription>
                Create and manage marketing campaigns and promotional offers
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <span>Role-based access control for admins, managers, analysts, and viewers</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <span>Real-time points tracking and transaction history</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <span>Campaign and referral program execution</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <span>Customer segmentation and tier management</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <span>Multi-channel reward availability and partner integration</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}