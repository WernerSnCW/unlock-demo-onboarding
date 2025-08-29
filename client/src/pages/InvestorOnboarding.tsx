import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Upload, FileText, CheckCircle, Sparkles, TrendingUp, Home, Building, Briefcase, ArrowRight, Cloud, Shield, Zap } from 'lucide-react';

export default function InvestorOnboarding() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-16 w-40 h-40 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-64 right-24 w-32 h-32 bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-48 left-24 w-28 h-28 bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] rounded-full blur-lg animate-pulse" style={{animationDelay: '2.5s'}}></div>
      </div>

      <Header />
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden min-h-[50vh] flex items-center justify-center">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-transparent to-[var(--secondary)] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-[var(--accent)] via-transparent to-[var(--warning)] opacity-5"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="flex items-center justify-center mb-8 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-8 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-16 w-16" />
                </div>
                <div className="absolute -top-3 -right-3 animate-bounce" style={{animationDelay: '0.5s'}}>
                  <Sparkles className="h-8 w-8 text-[var(--accent)] fill-current" />
                </div>
              </div>
            </div>

            <h1 className="relative mb-8">
              <span className="block text-5xl md:text-7xl font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent leading-none tracking-tight">
                INVESTOR ONBOARDING
              </span>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-2 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--muted-foreground)] max-w-4xl mx-auto mb-8 leading-relaxed font-light">
              Upload your complete investment portfolio to experience 
              <span className="text-[var(--primary)] font-semibold"> intelligent analysis and insights</span>
            </p>

            <div className="inline-flex items-center px-8 py-4 bg-[var(--card)] border-2 border-[var(--primary)] rounded-full shadow-2xl">
              <div className="flex items-center gap-4">
                <Shield className="h-6 w-6 text-[var(--success)]" />
                <span className="text-[var(--foreground)] font-semibold text-lg">STEP 1 OF 3</span>
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
                <span className="text-[var(--muted-foreground)] font-medium">Portfolio Upload</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Investment Categories Overview */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            
            {/* Traditional Investments */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center hover:shadow-xl transition-shadow group">
              <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full p-4 w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Traditional Holdings</h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Stocks, bonds, ETFs, mutual funds, pensions, and ISAs
              </p>
            </div>

            {/* Property Portfolio */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center hover:shadow-xl transition-shadow group">
              <div className="bg-gradient-to-br from-[var(--secondary)] to-[var(--accent)] rounded-full p-4 w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Building className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Property Portfolio</h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Buy-to-let, residential, commercial, REITs, and property funds
              </p>
            </div>

            {/* Alternative Investments */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center hover:shadow-xl transition-shadow group">
              <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] rounded-full p-4 w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="h-8 w-8 text-[var(--accent-foreground)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Alternative Assets</h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Startups, art, whisky, collectibles, private equity, and more
              </p>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-6">
                UPLOAD YOUR
                <span className="block bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                  PORTFOLIO DATA
                </span>
              </h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-3xl mx-auto leading-relaxed">
                Drag and drop your investment portfolio file, or click to browse. 
                Supports Excel, CSV, PDF, and other common formats.
              </p>
            </div>

            {/* Upload Area */}
            <div className="relative">
              <div className={`
                border-3 border-dashed rounded-3xl p-16 text-center transition-all duration-300 relative overflow-hidden
                ${dragActive || uploadComplete 
                  ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5' 
                  : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:bg-opacity-5'
                }
                ${uploadComplete ? 'bg-[var(--success)] bg-opacity-10 border-[var(--success)]' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              >
                {/* Background Animation */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-8 left-8 w-16 h-16 bg-[var(--primary)] rounded-full blur-lg animate-pulse"></div>
                  <div className="absolute bottom-12 right-12 w-12 h-12 bg-[var(--secondary)] rounded-full blur-md animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>

                <div className="relative z-10">
                  {!uploadComplete ? (
                    <>
                      <div className="mb-8">
                        <div className="relative inline-block group">
                          <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-6 shadow-xl group-hover:scale-110 transition-transform">
                            {isUploading ? (
                              <div className="animate-spin">
                                <Cloud className="h-16 w-16 text-white" />
                              </div>
                            ) : (
                              <FileText className="h-16 w-16 text-white" />
                            )}
                          </div>
                          <div className="absolute -inset-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                        </div>
                      </div>

                      {isUploading ? (
                        <>
                          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                            Uploading {uploadedFile?.name}...
                          </h3>
                          <div className="max-w-md mx-auto mb-6">
                            <div className="bg-[var(--muted)] rounded-full h-4 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-full transition-all duration-300 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-[var(--muted-foreground)] mt-2">{Math.round(uploadProgress)}% complete</p>
                          </div>
                        </>
                      ) : uploadedFile ? (
                        <>
                          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                            Ready to upload: {uploadedFile.name}
                          </h3>
                          <p className="text-[var(--muted-foreground)] mb-6">
                            File size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-3xl font-bold text-[var(--foreground)] mb-4">
                            Drop your portfolio file here
                          </h3>
                          <p className="text-xl text-[var(--muted-foreground)] mb-8">
                            or click to browse your files
                          </p>
                        </>
                      )}

                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleChange}
                        accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
                        data-testid="input-file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform cursor-pointer shadow-xl"
                        data-testid="button-browse-files"
                      >
                        <Upload className="h-6 w-6 mr-3" />
                        Browse Files
                      </label>

                      <div className="mt-8">
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Supported formats: Excel (.xlsx, .xls), CSV, PDF, Word documents
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-3xl shadow-2xl p-12 border border-[var(--border)]">
                      <div className="mb-8">
                        <div className="relative inline-block">
                          <div className="bg-gradient-to-br from-[var(--success)] to-[var(--primary)] rounded-full p-6 shadow-xl">
                            <CheckCircle className="h-20 w-20 text-white" />
                          </div>
                          <div className="absolute -inset-3 bg-gradient-to-r from-[var(--success)] to-[var(--primary)] rounded-full opacity-20 blur-xl animate-pulse"></div>
                        </div>
                      </div>

                      <h3 className="text-4xl font-black text-[var(--foreground)] mb-4">
                        Upload Complete!
                      </h3>
                      <p className="text-xl text-[var(--muted-foreground)] mb-10 leading-relaxed max-w-2xl mx-auto">
                        Your portfolio data has been successfully uploaded and is being processed by our advanced AI system.
                      </p>

                      <div className="bg-gradient-to-r from-[var(--success)] via-[var(--primary)] to-[var(--secondary)] rounded-2xl p-8 mb-10 text-white">
                        <div className="flex items-center justify-center gap-4 mb-6">
                          <div className="bg-white bg-opacity-20 rounded-full p-3">
                            <Zap className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="text-2xl font-bold text-white">AI Analysis in Progress</h4>
                        </div>
                        <p className="text-lg opacity-95 leading-relaxed text-center max-w-3xl mx-auto">
                          Our intelligent system is now analyzing your complete investment portfolio across traditional holdings, 
                          property investments, and alternative assets to provide personalized insights and recommendations.
                        </p>
                      </div>

                      <button
                        className="inline-flex items-center px-12 py-6 bg-gradient-to-r from-[var(--success)] to-[var(--primary)] text-white rounded-2xl font-black text-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-xl"
                        data-testid="button-continue-onboarding"
                        onClick={() => {
                          // In a real app, this would navigate to the next step
                          alert('Next: Portfolio Analysis & Insights (Step 2 of 3)');
                        }}
                      >
                        <span className="mr-4">Continue to Analysis</span>
                        <ArrowRight className="h-6 w-6" />
                      </button>

                      <div className="mt-8 text-center">
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Step 2 will show you comprehensive portfolio insights and recommendations
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-[var(--card)] border border-[var(--border)] rounded-full shadow-sm">
                <Shield className="h-5 w-5 text-[var(--success)] mr-2" />
                <span className="text-sm text-[var(--muted-foreground)]">
                  Your data is encrypted and processed securely
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}