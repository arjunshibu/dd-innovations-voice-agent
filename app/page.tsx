"use client"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, BarChart3, Mic, Globe, Zap, Brain } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col relative">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="mr-4">
                <Image
                  src="/ddlogo.png"
                  alt="DD Innovations Logo"
                  width={150}
                  height={100}
                  className="w-24 h-auto md:w-32 md:h-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-2">Jan Rakshak</h1>
                <p className="text-lg text-gray-600 font-medium">DD Innovations</p>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">AI Voice Command Center</h2>

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              <span className="font-semibold text-primary">AI-Powered Auto Audio Analysis</span> and Emergency
              Classification System with
              <span className="font-semibold text-primary"> Real-time Multi-Language Support</span> for Intelligent
              Alert Detection and Priority Routing
            </p>
          </div>

          {/* Main Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            <Link href="/alertanalysis">
              <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 bg-white overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-orange-400"></div>
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-full p-6 w-24 h-24 mx-auto mb-6 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                    <Mic className="h-12 w-12 text-primary mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Intelligent Voice Alert Analysis System</h3>
                  <p className="text-gray-600 text-lg mb-4">
                    Record and analyze voice alerts with intelligent AI processing and automatic language detection with
                    Jan Rakshak Voice Command AI
                  </p>
                  <div className="flex justify-center space-x-2">
                    <div className="flex items-center text-sm text-primary font-medium">
                      <Brain className="h-4 w-4 mr-1" />
                      AI Analysis
                    </div>
                    <div className="flex items-center text-sm text-primary font-medium">
                      <Globe className="h-4 w-4 mr-1" />
                      Multi-Language
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/classificationdashboard">
              <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 bg-white overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-orange-400"></div>
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-full p-6 w-24 h-24 mx-auto mb-6 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                    <BarChart3 className="h-12 w-12 text-primary mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Intelligent Alert Classification Dashboard</h3>
                  <p className="text-gray-600 text-lg mb-4">
                    View and manage AI-classified alerts with intelligent department routing and priority assignment
                  </p>
                  <div className="flex justify-center space-x-2">
                    <div className="flex items-center text-sm text-primary font-medium">
                      <Zap className="h-4 w-4 mr-1" />
                      Auto-Classify
                    </div>
                    <div className="flex items-center text-sm text-primary font-medium">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Smart Routing
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm border border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Real-time AI Detection</h4>
                <p className="text-sm text-gray-600">
                  Instant voice alert processing with intelligent emergency classification
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                  <Brain className="h-6 w-6 text-primary mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Smart AI Prioritization</h4>
                <p className="text-sm text-gray-600">
                  Machine learning-powered urgency classification and automated routing
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                  <Globe className="h-6 w-6 text-blue-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Multi-language AI Support</h4>
                <p className="text-sm text-gray-600">
                  Automatic language detection and processing across multiple languages
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Physical Product Image - Hidden on mobile, positioned on left side touching footer on desktop */}
      <div
        className="hidden md:block absolute bottom-0 left-4 md:left-8 z-10 pointer-events-none"
        style={{ bottom: "60px" }}
      >
        <Image
          src="/jr.png"
          alt="Jan Rakshak Emergency Kiosk"
          width={300}
          height={600}
          className="w-48 h-auto lg:w-56 lg:h-auto object-contain"
          priority
        />
      </div>

      {/* Fixed Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto relative z-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">© 2025 Copyright DD Innovations. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
