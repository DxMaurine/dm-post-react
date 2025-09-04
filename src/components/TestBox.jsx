import React from 'react';

export default function TestBox() {
  return (
    <div className="m-10 p-10 border-4 border-dashed border-red-500 bg-gray-200 dark:bg-gray-700">
      <h1 className="text-2xl font-bold text-black dark:text-white">
        Ini Kotak Tes Diagnostik
      </h1>
      <p className="mt-2 text-gray-700 dark:text-gray-300">
        Jika teks ini dan latar belakang kotak ini berubah warna saat mode gelap,
        artinya masalahnya ada di dalam komponen Sidebar/Layout, bukan di Tailwind.
      </p>
      <div className="mt-4 p-4 bg-yellow-200 dark:bg-indigo-800">
        <p className="text-black dark:text-yellow-200">
          Area ini harus berubah dari kuning ke nila.
        </p>
      </div>
    </div>
  );
}
