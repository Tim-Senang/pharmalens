<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body>
    <div>

        <a href="/logout" 
        class="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Logout</a>
        

        <!-- Scan Form -->
        <!-- Scan Form -->
        <section id="scan" class="py-16 bg-white">
            <div class="container mx-auto px-4 max-w-2xl">
                <h3 class="text-3xl font-bold text-center mb-2 text-green-600">
                    Mulai Scan Obat
                </h3>
                <p class="text-center text-gray-500 mb-6">
                    Unggah foto kemasan obat dan dapatkan informasinya secara instan
                </p>
                <form class="bg-gradient-to-r from-white to-green-50 p-8 rounded-xl shadow-lg space-y-6 border">
                    <div>
                        <label class="block mb-2 font-medium text-gray-700">Upload Foto Obat</label>
                        <input type="file"
                            class="w-full border border-gray-300 rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:bg-green-600 file:text-white hover:file:bg-green-700"
                            accept="image/*" />
                    </div>
                    <div>
                        <label class="block mb-2 font-medium text-gray-700">Hasil Scan</label>
                        <textarea class="w-full border rounded px-3 py-2 h-32 bg-gray-50" placeholder="Hasil scan akan muncul di sini..."
                            readonly></textarea>
                    </div>
                    <div class="flex justify-between">
                        <button type="button" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            Simpan Riwayat
                        </button>
                        <button type="reset" class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                            Scan Ulang
                        </button>
                    </div>
                </form>
            </div>
        </section>

        <!-- History -->
        <section id="history" class="py-16 bg-white">
            <div class="container mx-auto px-5 rounded-2xl max-w-[700px]">
                <h3 class="text-3xl font-bold text-gray-800 text-center mb-10">
                    Riwayat Scan
                </h3>
                <p class="text-center text-gray-600">Belum ada riwayat scan.</p>
            </div>
        </section>
    </div>
</body>

</html>
