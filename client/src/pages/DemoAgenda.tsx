import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Target, Users, ArrowRight, AlertCircle } from 'lucide-react';

export default function DemoAgenda() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Session Agenda Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Demo Session Agenda
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Investment Intelligence Platform Demonstration
            </p>
          </div>

          {/* Expectations Setting */}
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Demo Overview</h3>
                  <p className="text-blue-800 dark:text-blue-200">
                    This demo uses pre-set example portfolios to simulate how Unlock works. After the demo, you can either join the free waitlist or explore our founding investor programme.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agenda Items */}
          <div className="space-y-6">
            
            {/* 1. Problem We Solve */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                    <Target className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="text-xs">1</Badge>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Problem We Solve
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Traditional investment due diligence takes weeks of manual analysis, spreadsheet juggling, and fragmented research across multiple platforms.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Manual portfolio analysis and risk assessment
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Disconnected investment research tools
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Time-consuming due diligence processes
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Demo Walkthrough */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="text-xs">2</Badge>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Demo Walkthrough Tailored to Investor Interests
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Experience how Unlock transforms complex investment analysis into actionable insights, personalized to your investment profile and interests.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Portfolio Analysis</h4>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          <li>• Real-time portfolio assessment</li>
                          <li>• AI-powered risk insights</li>
                          <li>• Live market data integration</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Personalized Experience</h4>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          <li>• Investor profile matching</li>
                          <li>• Tailored economic scenarios</li>
                          <li>• Custom stress testing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Next Steps */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                    <ArrowRight className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="text-xs">3</Badge>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Next Steps
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Choose your path forward with Unlock's investment intelligence platform.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Free Account</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Join the waitlist for early access to our platform
                        </p>
                        <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                          <li>• Early access notification</li>
                          <li>• Beta testing opportunities</li>
                          <li>• Community updates</li>
                        </ul>
                      </div>
                      <div className="border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Founding Investor</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                          Exclusive access and investment opportunities
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• Priority platform access</li>
                          <li>• Investment opportunities</li>
                          <li>• Direct founder engagement</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-12">
            <Link href="/investor-onboarding">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white mr-4">
                Begin Demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}