export type Locale = "en" | "id";

export const translations = {
  en: {
    nav: {
      tools: "Tools",
      features: "Features",
      about: "About",
      getStarted: "Get Started",
    },
    hero: {
      badge: "No account required · 100% Client-side",
      headline1: "Smart tools for",
      headline2: "your files",
      sub: "Compress, convert, merge, split, and process files directly in your browser. No uploads. No server. No privacy risks.",
      exploreBtn: "Explore all tools",
      aiBtn: "Try AI Remove BG",
      highlights: [
        { label: "100% Private", desc: "Files never leave your browser" },
        { label: "Instant Fast", desc: "No upload wait times" },
        { label: "AI Powered", desc: "Smart background removal" },
      ],
    },
    tools: {
      sectionLabel: "All Tools",
      heading1: "Everything you need,",
      heading2: "right here",
      sub: "All tools run entirely in your browser. No sign-up, no ads, no file uploads to servers.",
      items: {
        "image-compress": {
          title: "Compress & Resize Image",
          description: "Reduce image file size while maintaining quality. Supports JPG, PNG, and WEBP formats.",
        },
        "image-convert": {
          title: "Convert Image Format",
          description: "Convert between JPG, PNG, WEBP, and more. Fast and lossless conversion in browser.",
        },
        "remove-bg": {
          title: "AI Remove Background",
          description: "Automatically remove image backgrounds using AI — no uploads, runs entirely in your browser.",
        },
        "image-to-pdf": {
          title: "Image to PDF",
          description: "Convert JPG, PNG, or WEBP images into a PDF. Set page size, orientation, and margins.",
        },
        "pdf-to-image": {
          title: "PDF to Image",
          description: "Convert PDF pages to high-quality JPEG or PNG images. Adjust resolution and download as ZIP.",
        },
        "pdf-merge": {
          title: "Merge PDF",
          description: "Combine multiple PDF files into one. Drag to reorder pages before merging.",
        },
        "pdf-split": {
          title: "Split PDF",
          description: "Split a PDF into individual pages or custom page ranges with ease.",
        },
        "pdf-compress": {
          title: "Compress PDF",
          description: "Reduce PDF file size by optimizing embedded images and removing metadata.",
        },
        "bulk-rename": {
          title: "Bulk Rename Files",
          description: "Rename multiple files at once using patterns, prefixes, suffixes, and numbering.",
        },
        "file-info": {
          title: "File Info & Converter",
          description: "View detailed file metadata and convert file size units — KB, MB, GB, TB.",
        },
        "video-to-gif": {
          title: "Video to GIF",
          description: "Convert MP4, WebM, or MOV video clips into animated GIFs. Control FPS, resolution, and duration — all in browser.",
        },
        "gif-to-video": {
          title: "GIF to Video",
          description: "Convert animated GIF files into MP4 videos. Lightweight, fast, and processed entirely in your browser.",
        },
        "video-to-mp3": {
          title: "Video to MP3",
          description: "Extract audio from MP4, WebM, or MOV videos and save as MP3. No uploads, runs fully in browser.",
        },
        "pdf-to-word": {
          title: "PDF to Word",
          description: "Convert PDF files into editable Word (.docx) documents. Text is extracted page by page — all in browser.",
        },
        "word-to-pdf": {
          title: "Word to PDF",
          description: "Convert Word (.docx) documents into PDF files. Laid out on A4 pages, processed entirely in your browser.",
        },
        "ppt-to-pdf": {
          title: "PPT to PDF",
          description: "Convert PowerPoint (.pptx) presentations into PDF. Each slide becomes a page — all processed in browser.",
        },
        "ppt-compress": {
          title: "Compress PPT",
          description: "Reduce .pptx file size using maximum compression and optional thumbnail removal. No uploads needed.",
        },
      },
    },
    features: {
      sectionLabel: "Why Filzy",
      heading1: "Built differently, for",
      heading2: "your privacy",
      sub: "Unlike other online tools, Filzy never touches your files on a server.",
      items: [
        {
          title: "Privacy First",
          description: "All processing is done locally in your browser using WebAssembly and JavaScript. Your files are never uploaded to any server.",
        },
        {
          title: "Blazing Fast",
          description: "No network latency. Processing happens instantly on your device using optimized algorithms and modern browser APIs.",
        },
        {
          title: "No Login Required",
          description: "Open any tool and start using it immediately. No account, no subscription, no email required — ever.",
        },
        {
          title: "Works Offline",
          description: "Once loaded, many tools work without an internet connection. Your productivity isn't limited by network access.",
        },
        {
          title: "AI-Powered Tools",
          description: "AI background removal runs entirely in your browser using machine learning models loaded from CDN — no server calls.",
        },
        {
          title: "Batch Processing",
          description: "Process multiple files at once. Compress a folder of images, rename dozens of files, or merge many PDFs in one click.",
        },
      ],
    },
    about: {
      sectionLabel: "About Filzy",
      heading1: "Your files stay on",
      heading2: "your device",
      p1: "Filzy is a collection of powerful file processing tools that run entirely in your browser using modern web technologies like WebAssembly, Canvas API, and client-side machine learning.",
      p2: "Unlike traditional online tools that upload your files to remote servers, Filzy processes everything locally. This means faster results, zero privacy risk, and no dependency on network connectivity after the initial page load.",
      p3built: "Built with Next.js 16, React, and libraries like",
      stats: [
        { label: "Built-in Tools" },
        { label: "Client-side Processing" },
        { label: "Data Uploaded to Server" },
        { label: "Always & Forever" },
      ],
    },
    footer: {
      privacy: "All processing happens in your browser.",
      privacyHighlight: "Your files never leave your device.",
      copyright: "Built for privacy-first file processing.",
      links: ["Privacy", "Terms", "GitHub"],
    },
    dropzone: {
      or: "or click to browse",
      dragActive: "Drop files here",
    },
    common: {
      download: "Download",
      downloadAll: "Download All",
      remove: "Remove",
      retry: "Retry",
      cancel: "Cancel",
      processing: "Processing...",
      done: "Done",
      error: "Error",
      selectAll: "Select all",
      deselectAll: "Deselect all",
      selected: "selected",
      back: "Back to Tools",
    },
  },

  id: {
    nav: {
      tools: "Alat",
      features: "Fitur",
      about: "Tentang",
      getStarted: "Mulai",
    },
    hero: {
      badge: "Tanpa akun · 100% di Browser",
      headline1: "Alat pintar untuk",
      headline2: "file kamu",
      sub: "Kompres, konversi, gabung, pisah, dan proses file langsung di browsermu. Tanpa upload. Tanpa server. Tanpa risiko privasi.",
      exploreBtn: "Jelajahi semua alat",
      aiBtn: "Coba AI Hapus BG",
      highlights: [
        { label: "100% Privat", desc: "File tidak pernah keluar dari browser" },
        { label: "Super Cepat", desc: "Tanpa waktu tunggu upload" },
        { label: "Bertenaga AI", desc: "Hapus latar belakang otomatis" },
      ],
    },
    tools: {
      sectionLabel: "Semua Alat",
      heading1: "Semua yang kamu butuhkan,",
      heading2: "di sini",
      sub: "Semua alat berjalan sepenuhnya di browsermu. Tanpa daftar, tanpa iklan, tanpa upload file ke server.",
      items: {
        "image-compress": {
          title: "Kompres & Resize Gambar",
          description: "Kurangi ukuran file gambar dengan tetap menjaga kualitas. Mendukung JPG, PNG, dan WEBP.",
        },
        "image-convert": {
          title: "Konversi Format Gambar",
          description: "Konversi antara JPG, PNG, WEBP, dan lainnya. Konversi cepat dan lossless di browser.",
        },
        "remove-bg": {
          title: "Hapus Latar Belakang AI",
          description: "Hapus latar belakang gambar secara otomatis menggunakan AI — tanpa upload, berjalan di browser.",
        },
        "image-to-pdf": {
          title: "Gambar ke PDF",
          description: "Konversi gambar JPG, PNG, atau WEBP menjadi PDF. Atur ukuran halaman, orientasi, dan margin.",
        },
        "pdf-to-image": {
          title: "PDF ke Gambar",
          description: "Konversi halaman PDF menjadi gambar JPEG atau PNG berkualitas tinggi. Unduh sebagai ZIP.",
        },
        "pdf-merge": {
          title: "Gabung PDF",
          description: "Gabungkan beberapa file PDF menjadi satu. Atur urutan halaman sebelum digabung.",
        },
        "pdf-split": {
          title: "Pisah PDF",
          description: "Pisah PDF menjadi halaman individual atau rentang halaman tertentu dengan mudah.",
        },
        "pdf-compress": {
          title: "Kompres PDF",
          description: "Kurangi ukuran file PDF dengan mengoptimalkan gambar dan menghapus metadata.",
        },
        "bulk-rename": {
          title: "Ganti Nama Massal",
          description: "Ganti nama banyak file sekaligus menggunakan pola, awalan, akhiran, dan penomoran.",
        },
        "file-info": {
          title: "Info File & Konverter",
          description: "Lihat metadata file secara detail dan konversi satuan ukuran file — KB, MB, GB, TB.",
        },
        "video-to-gif": {
          title: "Video ke GIF",
          description: "Konversi klip video MP4, WebM, atau MOV menjadi GIF animasi. Atur FPS, resolusi, dan durasi — semua di browser.",
        },
        "gif-to-video": {
          title: "GIF ke Video",
          description: "Konversi file GIF animasi menjadi video MP4. Ringan, cepat, dan diproses sepenuhnya di browsermu.",
        },
        "video-to-mp3": {
          title: "Video ke MP3",
          description: "Ekstrak audio dari video MP4, WebM, atau MOV dan simpan sebagai MP3. Tanpa upload, berjalan penuh di browser.",
        },
        "pdf-to-word": {
          title: "PDF ke Word",
          description: "Konversi file PDF menjadi dokumen Word (.docx) yang bisa diedit. Teks diekstrak per halaman — semua di browser.",
        },
        "word-to-pdf": {
          title: "Word ke PDF",
          description: "Konversi dokumen Word (.docx) menjadi file PDF. Ditata dalam halaman A4, diproses sepenuhnya di browsermu.",
        },
        "ppt-to-pdf": {
          title: "PPT ke PDF",
          description: "Konversi presentasi PowerPoint (.pptx) menjadi PDF. Setiap slide jadi satu halaman — semua di browser.",
        },
        "ppt-compress": {
          title: "Kompres PPT",
          description: "Kurangi ukuran file .pptx dengan kompresi maksimum dan hapus thumbnail opsional. Tanpa upload.",
        },
      },
    },
    features: {
      sectionLabel: "Mengapa Filzy",
      heading1: "Dirancang berbeda, untuk",
      heading2: "privasimu",
      sub: "Berbeda dari alat online lainnya, Filzy tidak pernah menyentuh file kamu di server.",
      items: [
        {
          title: "Privasi Utama",
          description: "Semua pemrosesan dilakukan secara lokal di browsermu menggunakan WebAssembly dan JavaScript. File-mu tidak pernah diunggah ke server manapun.",
        },
        {
          title: "Super Cepat",
          description: "Tanpa latensi jaringan. Pemrosesan terjadi secara instan di perangkatmu menggunakan algoritma yang dioptimalkan dan API browser modern.",
        },
        {
          title: "Tanpa Login",
          description: "Buka alat manapun dan langsung gunakan. Tanpa akun, tanpa langganan, tanpa email — selamanya.",
        },
        {
          title: "Bekerja Offline",
          description: "Setelah dimuat, banyak alat berfungsi tanpa koneksi internet. Produktivitasmu tidak dibatasi oleh akses jaringan.",
        },
        {
          title: "Alat Bertenaga AI",
          description: "Penghapusan latar belakang AI berjalan sepenuhnya di browsermu menggunakan model machine learning yang dimuat dari CDN — tanpa panggilan server.",
        },
        {
          title: "Proses Massal",
          description: "Proses banyak file sekaligus. Kompres folder gambar, ganti nama puluhan file, atau gabung banyak PDF dalam satu klik.",
        },
      ],
    },
    about: {
      sectionLabel: "Tentang Filzy",
      heading1: "File-mu tetap ada di",
      heading2: "perangkatmu",
      p1: "Filzy adalah kumpulan alat pemrosesan file bertenaga tinggi yang berjalan sepenuhnya di browsermu menggunakan teknologi web modern seperti WebAssembly, Canvas API, dan machine learning sisi klien.",
      p2: "Tidak seperti alat online tradisional yang mengunggah file ke server jarak jauh, Filzy memproses semuanya secara lokal. Ini berarti hasil lebih cepat, tanpa risiko privasi, dan tidak bergantung pada koneksi jaringan setelah halaman dimuat.",
      p3built: "Dibangun dengan Next.js 16, React, dan library seperti",
      stats: [
        { label: "Alat Bawaan" },
        { label: "Proses Sisi Klien" },
        { label: "Data Diunggah ke Server" },
        { label: "Selalu & Selamanya" },
      ],
    },
    footer: {
      privacy: "Semua pemrosesan terjadi di browsermu.",
      privacyHighlight: "File-mu tidak pernah meninggalkan perangkatmu.",
      copyright: "Dibangun untuk pemrosesan file yang mengutamakan privasi.",
      links: ["Privasi", "Ketentuan", "GitHub"],
    },
    dropzone: {
      or: "atau klik untuk pilih file",
      dragActive: "Lepaskan file di sini",
    },
    common: {
      download: "Unduh",
      downloadAll: "Unduh Semua",
      remove: "Hapus",
      retry: "Coba Lagi",
      cancel: "Batal",
      processing: "Memproses...",
      done: "Selesai",
      error: "Error",
      selectAll: "Pilih semua",
      deselectAll: "Batalkan semua",
      selected: "dipilih",
      back: "Kembali ke Alat",
    },
  },
} as const;

// Recursively replaces literal string types with `string` so both locales satisfy the type
type Stringify<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
  ? readonly Stringify<U>[]
  : T extends object
  ? { [K in keyof T]: Stringify<T[K]> }
  : T;

export type Translations = Stringify<typeof translations.en>;
