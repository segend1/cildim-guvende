export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white p-8">
            <div className="text-center max-w-lg">
                <div className="text-6xl mb-6">🛠️</div>
                <h1 className="text-4xl font-bold mb-4">Bakımdayız</h1>
                <p className="text-xl mb-8 opacity-90">
                    Sitemizi sizin için daha iyi hale getiriyoruz. Kısa süre içinde geri döneceğiz!
                </p>
                <div className="animate-pulse">
                    <div className="w-16 h-1 bg-white/50 rounded-full mx-auto"></div>
                </div>
                <p className="mt-8 text-sm opacity-70">
                    Cildim Güvende
                </p>
            </div>
        </div>
    );
}
