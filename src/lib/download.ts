/**
 * Direct file download utility using fetch -> blob -> object URL.
 * Bypasses browser navigation and downloads file directly with original name.
 */
export async function downloadFileFromUrl(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url, {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error(`Fetch failed with status ${res.status}`);
    }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (err) {
    console.warn('[downloadFileFromUrl] Blob download fallback to direct anchor:', err);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    link.target = '_self';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
