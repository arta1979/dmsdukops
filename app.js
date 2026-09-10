const GOOGLE_APPS_SCRIPT_WEBHOOK = "https://script.google.com/macros/s/AKfycbyiJ0uO36CdtGUiy8m03jzwMAUWWMwIILpdBLt5J41ne6aQWHYIp_Cr_Ke6K8iqn4gZ/exec";

async function sendToBackend(action, data = {}) {
    const allowedActions = ["uploadDrive"];
    if (!allowedActions.includes(action)) {
        throw new Error(`Action "${action}" tidak tersedia`);
    }

    const formData = new FormData();
    formData.append("action", action);
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, String(data[key]));
        }
    });

    const response = await fetch(GOOGLE_APPS_SCRIPT_WEBHOOK, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Backend gagal (HTTP ${response.status})`);
    }

    return response.json();
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (typeof result !== "string") {
                reject(new Error("Gagal membaca file laporan"));
                return;
            }
            resolve(result.split(",")[1]);
        };
        reader.onerror = () => reject(new Error("Gagal membaca file laporan"));
        reader.readAsDataURL(blob);
    });
}

async function uploadToGoogleDrive(zipBlob, zipFileName, desaName, date) {
    const result = await sendToBackend("uploadDrive", {
        fileName: zipFileName,
        desaName,
        fileData: await blobToBase64(zipBlob),
        year: String(date.getFullYear()),
        month: date.toLocaleDateString("id-ID", { month: "long" }),
        desa: desaName,
        mimeType: "application/zip"
    });
    return result.success === true;
}

window.sendToBackend = sendToBackend;
window.uploadToGoogleDrive = uploadToGoogleDrive;
