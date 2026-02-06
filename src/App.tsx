import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

type CryptoType = 'btc' | 'eth' | 'sol' | 'usdt' | 'ltc';

interface CryptoConfig {
  name: string;
  symbol: string;
  prefix: string;
  color: string;
  glow: string;
}

const CRYPTO_CONFIG: Record<CryptoType, CryptoConfig> = {
  btc: { name: 'Bitcoin', symbol: 'BTC', prefix: 'bitcoin:', color: '#F7931A', glow: 'rgba(247, 147, 26, 0.5)' },
  eth: { name: 'Ethereum', symbol: 'ETH', prefix: 'ethereum:', color: '#627EEA', glow: 'rgba(98, 126, 234, 0.5)' },
  sol: { name: 'Solana', symbol: 'SOL', prefix: 'solana:', color: '#00FFA3', glow: 'rgba(0, 255, 163, 0.5)' },
  usdt: { name: 'Tether', symbol: 'USDT', prefix: 'tether:', color: '#26A17B', glow: 'rgba(38, 161, 123, 0.5)' },
  ltc: { name: 'Litecoin', symbol: 'LTC', prefix: 'litecoin:', color: '#BFBBBB', glow: 'rgba(191, 187, 187, 0.5)' },
};

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>('btc');
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const config = CRYPTO_CONFIG[selectedCrypto];

  useEffect(() => {
    if (walletAddress) {
      generateQR();
    } else {
      setQrDataUrl('');
    }
  }, [walletAddress, amount, selectedCrypto]);

  const generateQR = async () => {
    if (!walletAddress) return;

    setIsGenerating(true);

    let paymentUri = `${config.prefix}${walletAddress}`;
    if (amount) {
      paymentUri += `?amount=${amount}`;
    }

    try {
      const dataUrl = await QRCode.toDataURL(paymentUri, {
        width: 280,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#00000000',
        },
        errorCorrectionLevel: 'H',
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR generation failed:', err);
    }

    setTimeout(() => setIsGenerating(false), 300);
  };

  const copyToClipboard = async () => {
    if (!walletAddress) return;

    let paymentUri = `${config.prefix}${walletAddress}`;
    if (amount) {
      paymentUri += `?amount=${amount}`;
    }

    await navigator.clipboard.writeText(paymentUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `${config.symbol.toLowerCase()}-payment-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden flex flex-col">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridPulse 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div
        className="fixed top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 transition-all duration-1000"
        style={{ background: config.color }}
      />
      <div
        className="fixed bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-1000"
        style={{ background: config.color }}
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-3"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span className="text-white/90">CRYPTO</span>
            <span
              className="ml-2 transition-colors duration-500"
              style={{ color: config.color }}
            >
              PAY
            </span>
          </h1>
          <p
            className="text-white/40 text-xs md:text-sm tracking-[0.3em] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Generate Payment QR Codes
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl">
          <div
            className="relative p-[1px] rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${config.color}40, transparent 50%, ${config.color}20)`,
            }}
          >
            <div className="bg-[#0d0d14]/95 backdrop-blur-xl rounded-2xl p-4 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Left Side - Form */}
                <div className="space-y-5 md:space-y-6">
                  {/* Crypto Selector */}
                  <div>
                    <label
                      className="block text-white/50 text-xs mb-3 tracking-wider uppercase"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Select Currency
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {(Object.keys(CRYPTO_CONFIG) as CryptoType[]).map((crypto) => (
                        <button
                          key={crypto}
                          onClick={() => setSelectedCrypto(crypto)}
                          className={`
                            relative p-2 md:p-3 rounded-lg transition-all duration-300
                            flex flex-col items-center justify-center gap-1
                            ${selectedCrypto === crypto
                              ? 'bg-white/10'
                              : 'bg-white/5 hover:bg-white/8'
                            }
                          `}
                          style={{
                            boxShadow: selectedCrypto === crypto
                              ? `0 0 20px ${CRYPTO_CONFIG[crypto].glow}`
                              : 'none',
                            borderColor: selectedCrypto === crypto
                              ? CRYPTO_CONFIG[crypto].color
                              : 'transparent',
                            borderWidth: '1px',
                          }}
                        >
                          <span
                            className="text-xs md:text-sm font-bold transition-colors duration-300"
                            style={{
                              color: selectedCrypto === crypto
                                ? CRYPTO_CONFIG[crypto].color
                                : 'rgba(255,255,255,0.6)',
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {CRYPTO_CONFIG[crypto].symbol}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wallet Address Input */}
                  <div>
                    <label
                      className="block text-white/50 text-xs mb-3 tracking-wider uppercase"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Wallet Address
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder={`Enter your ${config.name} address`}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 md:py-4 text-sm md:text-base text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all duration-300"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      />
                      <div
                        className="absolute inset-0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          boxShadow: `0 0 30px ${config.glow}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label
                      className="block text-white/50 text-xs mb-3 tracking-wider uppercase"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Amount <span className="text-white/30">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 md:py-4 text-sm md:text-base text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all duration-300"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      />
                      <span
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold transition-colors duration-500"
                        style={{ color: config.color, fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {config.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Desktop */}
                  <div className="hidden lg:flex gap-3 pt-2">
                    <button
                      onClick={copyToClipboard}
                      disabled={!walletAddress}
                      className="flex-1 py-3 px-4 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {copied ? '// COPIED!' : '// COPY URI'}
                    </button>
                    <button
                      onClick={downloadQR}
                      disabled={!qrDataUrl}
                      className="flex-1 py-3 px-4 rounded-lg text-black font-bold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                      style={{
                        background: config.color,
                        fontFamily: "'JetBrains Mono', monospace",
                        boxShadow: qrDataUrl ? `0 0 30px ${config.glow}` : 'none',
                      }}
                    >
                      DOWNLOAD QR
                    </button>
                  </div>
                </div>

                {/* Right Side - QR Display */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    className="relative p-[2px] rounded-2xl overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${config.color}, ${config.color}40, ${config.color})`,
                      animation: 'borderGlow 3s ease-in-out infinite',
                    }}
                  >
                    <div className="bg-[#0a0a0f] rounded-2xl p-6 md:p-8 relative overflow-hidden">
                      {/* Scan Lines Effect */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-10"
                        style={{
                          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                        }}
                      />

                      {/* QR Code Container */}
                      <div
                        className={`
                          w-48 h-48 md:w-64 md:h-64 flex items-center justify-center relative
                          transition-all duration-500
                          ${isGenerating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}
                        `}
                      >
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt="Payment QR Code"
                            className="w-full h-full"
                            style={{
                              filter: `drop-shadow(0 0 20px ${config.glow})`,
                            }}
                          />
                        ) : (
                          <div className="text-center">
                            <div
                              className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center"
                            >
                              <svg className="w-10 h-10 md:w-12 md:h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                            </div>
                            <p
                              className="text-white/30 text-xs"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              Enter address to generate
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Currency Badge */}
                      <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wider transition-all duration-500"
                        style={{
                          background: config.color,
                          color: '#000',
                          fontFamily: "'JetBrains Mono', monospace",
                          boxShadow: `0 0 20px ${config.glow}`,
                        }}
                      >
                        {config.symbol}
                      </div>
                    </div>
                  </div>

                  {/* Payment Info Display */}
                  {walletAddress && (
                    <div
                      className="mt-6 text-center opacity-0 animate-fadeIn"
                      style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
                    >
                      <p
                        className="text-white/40 text-xs mb-1"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {amount ? `${amount} ${config.symbol}` : 'Any amount'}
                      </p>
                      <p
                        className="text-white/30 text-[10px] max-w-[200px] md:max-w-[250px] truncate"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {walletAddress}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Mobile */}
                <div className="flex lg:hidden gap-3 col-span-1">
                  <button
                    onClick={copyToClipboard}
                    disabled={!walletAddress}
                    className="flex-1 py-4 px-4 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {copied ? '// COPIED!' : '// COPY URI'}
                  </button>
                  <button
                    onClick={downloadQR}
                    disabled={!qrDataUrl}
                    className="flex-1 py-4 px-4 rounded-lg text-black font-bold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                    style={{
                      background: config.color,
                      fontFamily: "'JetBrains Mono', monospace",
                      boxShadow: qrDataUrl ? `0 0 30px ${config.glow}` : 'none',
                    }}
                  >
                    DOWNLOAD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p
          className="mt-8 text-white/20 text-[10px] md:text-xs text-center max-w-md"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          // All QR codes are generated locally. No data is sent to any server.
        </p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p
          className="text-white/25 text-[10px] md:text-xs"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Requested by <a href="https://twitter.com/EscapeDmatrics" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">@EscapeDmatrics</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">@clonkbot</a>
        </p>
      </footer>

      {/* Global Styles */}
      <style>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }

        @keyframes borderGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}

export default App;
