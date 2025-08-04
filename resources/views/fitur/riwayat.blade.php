<!DOCTYPE html>
<html class="scroll-smooth">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <!-- Favicon -->
        <link rel="shortcut icon" href="{{ asset('images/pharmalens.png') }}" type="image/x-icon" />

        <!-- Font Awesome CDN -->
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css"
            integrity="sha512-DxV+EoADOkOygM4IR9yXP8Sb2qwgidEmeqAEmDKIOfPRQZOWbXCzLC6vjbZyy0vPisbH2SyW27+ddLVCN+OMzQ=="
            crossorigin="anonymous"
            referrerpolicy="no-referrer"
        />

        <!-- Font Inter -->
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
            rel="stylesheet"/>

        <!-- Jonsuh Hamburger -->
        <link rel="stylesheet" href="{{ asset('css/hamburgers.css') }}" />

        <!-- Animate Style -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>

        <!-- AOS (Animate on Scroll) -->
        <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />

        <!-- CSS -->
        <link rel="stylesheet" href="{{ asset('css/input.css') }}" />
        <link rel="stylesheet" href="{{ asset('css/output.css') }}" />
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        <title>Pharmalens | Riwayat Scan</title>
    </head>
    <body class="overflow-x-hidden bg-green-900">
        
    <!-- Navbar -->
    <div class="navbar px-4 py-1 sticky top-0 text-green-900 bg-white z-50">
        <div class="container mx-auto">
            <div class="navbar-box flex items-center justify-between">
                <div class="logo flex items-center gap-x-2">
                    <img
                    src="{{ asset('images/pharmalens.png') }}"
                    alt="flaticon.com"
                    class="md:w-9 w-7"/>
                    <h1 class="font-extrabold md:text-xl text-md">Pharmalens</h1>
                </div>
            <ul class="menu flex gap-x-4 py-1 items-center font-bold md:static absolute z-10 top-17 left-0 md:flex-row flex-col md:bg-transparent bg-green-100 md:text-green-800 text-green-700 md:w-auto w-full">
                <li class="py-4 w-full text-center">
                <a
                    href="{{ route('welcome') }}"
                    class="p-4 hover:bg-green-900 hover:text-green-100 rounded-2xl duration-500"
                    >Beranda</a
                >
                </li>
                <li class="py-4 w-full text-center">
                <a
                    href="{{route('welcome')}}#tentang"
                    class="p-4 hover:bg-green-900 hover:text-green-100 rounded-2xl duration-500"
                    >Tentang</a
                >
                </li>
                <li class="py-4 w-full text-center">
                <a
                    href="{{route('welcome')}}#fitur"
                    class="p-4 hover:bg-green-900 hover:text-green-100 rounded-2xl duration-500"
                    >Fitur</a
                >
                </li>
                <li class="py-4 w-full text-center">
                <a
                    href="{{ route('scan') }}"
                    class="p-4 hover:bg-green-900 hover:text-green-100 rounded-2xl duration-500"
                    >Scan</a
                >
                </li>
                <li class="py-4 w-full text-center">
                <a
                    href="/riwayat"
                    class="p-4 hover:bg-green-900 hover:text-green-100 rounded-2xl duration-500"
                    >Riwayat</a
                >
                </li>
            </ul>

            <div class="md:hidden block">
                <button class="hamburger hamburger--elastic" type="button">
                    <span class="hamburger-box">
                        <span class="hamburger-inner"></span>
                    </span>
                </button>
            </div>
        </div>
        </div>
    </div>
    <!-- Navbar -->

    <!-- Main Content -->
    <div class="my-12 md:px-28 sm:px-9 px-4 h-screen">
        <div class="mx-auto px-4">
            <h1 class="md:text-3xl text-2xl  font-bold text-slate-100 mb-12">
            Riwayat Scan
            </h1>

            <div class="scan-form bg-green-100 flex flex-col items-center justify-center md:gap-8 gap-2 p-7 rounded-2xl min-h-[450px]">
                <img src="{{ asset('images/history-scan.svg') }}" alt="undraw.co" class="md:w-[150px] w-[120px]">
                <p>Belum Ada Riwayat</p>
            </div>                     
        </div>
    </div>
    <!-- Main Content -->


    <!-- Footer -->
    <div class="footer py-7 bg-green-100 text-green-900 bottom-0">
        <div class="container mx-auto px-4">
            <div class="footer-box flex justify-center items-center flex-col gap-5">
                <div class="box lg:w-[500px]">
                    <div class="logo flex justify-center items-center gap-2">
                        <img src="{{ asset('images/pharmalens.png') }}" alt="flaticon.com" class="md:w-12 w-9" />
                        <h1 class="font-bold md:text-xl text-sm">Pharmalens</h1>
                    </div>
                </div>
                <div class="box flex items-center justify-center lg:w-[80px] w-[60px] md:gap-10 gap-3 font-bold md:text-[15px] text-[12px]">
                    <a href="index.html#beranda" class="opacity-70 hover:opacity-100">Beranda</a>
                    <a href="index.html#fitur" class="opacity-70 hover:opacity-100">Tentang</a>
                    <a href="index.html#layanan" class="opacity-70 hover:opacity-100">Fitur</a>
                    <a href="scan-obat.html" class="opacity-70 hover:opacity-100">Scan</a>
                    <a href="riwayat-scan.html" class="opacity-70 hover:opacity-100">Riwayat</a>
                </div>
                <hr class="w-full border-t-1 border-green-900" />
                <p class="text-xs">&copy; 2025 Pharmalens | All Rights Reserved</p>
            </div>
        </div>
    </div>
    <!-- Footer -->

    <!-- JS -->
    <script src="{{ asset('js/script.js') }}"></script>

    <!-- JS AOS (Animate on Screen) -->
    <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
    <script>
      AOS.init();
    </script>
  </body>
</html>
