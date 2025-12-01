import React, { useState, useRef, useCallback } from 'react';
import { 
  IconScanFace, 
  IconSparkles, 
  IconRefresh, 
  IconShirt, 
  IconImage, 
  IconUpload, 
  IconLoader, 
  IconWand,
  IconDownload
} from './components/Icons';
import { FEATURE_CONFIGS } from './constants';
import { FeatureType, ProcessResult } from './types';
import { fileToGenerativePart, processImageWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<FeatureType | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
        setError(null);
      } else {
        setError('请上传有效的图片文件 (JPG, PNG)');
      }
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  }, []);

  const handleFeatureSelect = (type: FeatureType) => {
    setActiveFeature(type);
    const config = FEATURE_CONFIGS.find(c => c.id === type);
    if (config) {
      // Clear custom prompt if switching features
      setCustomPrompt(''); 
    }
  };

  const handleProcess = async () => {
    if (!selectedFile || !activeFeature) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const config = FEATURE_CONFIGS.find(c => c.id === activeFeature);
      if (!config) throw new Error("Unknown feature");

      // Construct the final prompt
      let finalPrompt = config.defaultPrompt;
      
      if (config.requiresInput && customPrompt.trim()) {
        if (activeFeature === FeatureType.FACE_SWAP) {
            finalPrompt = `Replace the face of the person with: ${customPrompt}. Keep pose and lighting consistent.`;
        } else if (activeFeature === FeatureType.CHANGE_CLOTHES) {
            finalPrompt = `Change the person's clothing to: ${customPrompt}. Keep body shape and pose.`;
        } else if (activeFeature === FeatureType.CHANGE_BACKGROUND) {
            finalPrompt = `Change the background to: ${customPrompt}. Keep foreground subject isolated.`;
        }
      }

      const base64Data = await fileToGenerativePart(selectedFile);
      const res = await processImageWithGemini(
        base64Data, 
        selectedFile.type, 
        activeFeature, 
        finalPrompt
      );

      setResult(res);
    } catch (err: any) {
      setError(err.message || "处理失败，请稍后重试。");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderIcon = (iconName: string, className?: string) => {
    switch (iconName) {
      case 'scan': return <IconScanFace className={className} />;
      case 'sparkles': return <IconSparkles className={className} />;
      case 'refresh': return <IconRefresh className={className} />;
      case 'shirt': return <IconShirt className={className} />;
      case 'image': return <IconImage className={className} />;
      default: return <IconSparkles className={className} />;
    }
  };

  const activeConfig = FEATURE_CONFIGS.find(c => c.id === activeFeature);
  const isApiKeyError = error?.includes("API Key");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <IconWand className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              智能影像工坊
            </h1>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          
          {/* Left Column: Upload & Controls */}
          <div className="space-y-6">
            
            {/* Upload Area */}
            <div 
              className={`
                relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300
                flex flex-col items-center justify-center text-center min-h-[300px]
                ${!previewUrl ? 'border-slate-700 bg-slate-900 hover:border-indigo-500/50 hover:bg-slate-800/50' : 'border-slate-700 bg-black/40'}
              `}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center group">
                  <img 
                    src={previewUrl} 
                    alt="Original" 
                    className="max-h-[400px] w-auto rounded-lg shadow-xl object-contain" 
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/10 backdrop-blur text-white px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all"
                    >
                      更换图片
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                    <IconUpload className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-200">点击或拖拽上传图片</h3>
                    <p className="text-slate-500 text-sm mt-1">支持 JPG, PNG 格式</p>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    选择文件
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            {/* Feature Selection Grid */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">选择功能</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FEATURE_CONFIGS.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureSelect(feature.id)}
                    disabled={!selectedFile || isProcessing}
                    className={`
                      relative group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${activeFeature === feature.id 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                      }
                    `}
                  >
                    {renderIcon(feature.icon, `w-6 h-6 mb-2 ${activeFeature === feature.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`)}
                    <span className="text-sm font-medium">{feature.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Config & Action Area */}
            {activeConfig && (
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 animate-fade-in-up">
                <div className="mb-4">
                  <h3 className="font-medium text-white flex items-center gap-2">
                    {renderIcon(activeConfig.icon, "w-4 h-4 text-indigo-400")}
                    {activeConfig.label}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{activeConfig.description}</p>
                </div>

                {activeConfig.requiresInput && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      {activeConfig.inputLabel}
                    </label>
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder={activeConfig.id === FeatureType.CHANGE_CLOTHES ? "例如：黑色晚礼服" : "在此输入描述..."}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )}

                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className={`
                    w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
                    ${isProcessing 
                      ? 'bg-slate-800 text-slate-400 cursor-wait' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                    }
                  `}
                >
                  {isProcessing ? (
                    <>
                      <IconLoader className="w-5 h-5 animate-spin" />
                      正在处理...
                    </>
                  ) : (
                    <>
                      <IconWand className="w-5 h-5" />
                      开始生成
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className={`
                border px-4 py-4 rounded-lg text-sm flex items-start gap-3
                ${isApiKeyError ? "bg-amber-900/20 border-amber-500/50 text-amber-200" : "bg-red-900/20 border-red-500/50 text-red-200"}
              `}>
                <div className="flex-1">
                   <p className="font-bold flex items-center gap-2">
                     {isApiKeyError ? "⚙️ 配置缺失" : "⚠️ 处理出错"}
                   </p>
                   <p className="mt-1 opacity-90">{error}</p>
                   
                   {isApiKeyError && (
                     <div className="mt-3 text-xs bg-black/30 p-3 rounded border border-amber-500/20 text-amber-100/80 space-y-2">
                       <p className="font-semibold text-amber-400">如何解决:</p>
                       <ul className="list-disc pl-4 space-y-1">
                         <li>
                           <span className="font-medium text-amber-100">Vercel 部署:</span> 
                           在 Settings &gt; Environment Variables 中添加 <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300">API_KEY</code>
                         </li>
                         <li>
                           <span className="font-medium text-amber-100">本地 Vite 运行:</span> 
                           在根目录创建 <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300">.env</code> 文件并添加 <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300">VITE_API_KEY=您的KEY</code>
                         </li>
                       </ul>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Result Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[500px]">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">处理结果</h2>
            
            <div className="flex-1 flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
              {isProcessing ? (
                <div className="text-center space-y-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-slate-400 animate-pulse">AI 正在施展魔法...</p>
                </div>
              ) : result ? (
                <div className="w-full h-full flex flex-col animate-fade-in">
                  {result.type === 'image' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                      <img 
                        src={result.content} 
                        alt="Processed Result" 
                        className="max-h-[600px] w-auto max-w-full object-contain shadow-2xl rounded-lg"
                      />
                      <a 
                        href={result.content} 
                        download={`ai-result-${Date.now()}.png`}
                        className="absolute bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110"
                        title="下载图片"
                      >
                        <IconDownload className="w-6 h-6" />
                      </a>
                    </div>
                  ) : (
                    <div className="p-8 w-full max-w-2xl mx-auto overflow-y-auto max-h-[600px]">
                      <div className="prose prose-invert">
                        <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
                          <IconScanFace className="w-6 h-6" /> 识别分析报告
                        </h3>
                        <div className="whitespace-pre-wrap text-slate-300 leading-relaxed bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                          {result.content}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-600">
                  <IconImage className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>预览区域</p>
                  <p className="text-sm mt-1 opacity-60">处理后的图片或分析结果将显示在这里</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center text-slate-600 text-sm">
          <p>&copy; {new Date().getFullYear()} 智能影像工坊. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;