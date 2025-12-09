import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallPWAButton() {
    const { isInstallable, install } = usePWAInstall();

    if (!isInstallable) {
        return null;
    }

    return (
        <button
            onClick={install}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
            title="Install App"
        >
            <Download size={16} />
            <span className="hidden sm:inline">Install</span>
        </button>
    );
}
