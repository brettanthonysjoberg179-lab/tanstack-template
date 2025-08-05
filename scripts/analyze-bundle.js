#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const BUILD_DIR = '.vinxi/build/client/_build/assets';

function analyzeBundle() {
  try {
    const files = fs.readdirSync(BUILD_DIR);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    
    console.log('📦 Bundle Analysis Report');
    console.log('========================\n');
    
    let totalSize = 0;
    let totalGzipSize = 0;
    
    const fileSizes = jsFiles.map(file => {
      const filePath = path.join(BUILD_DIR, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      const gzipSizeKB = parseFloat(file.match(/gzip:\s*([\d.]+)\s*kB/)?.[1] || '0');
      
      totalSize += parseFloat(sizeKB);
      totalGzipSize += gzipSizeKB;
      
      return {
        file,
        size: parseFloat(sizeKB),
        gzipSize: gzipSizeKB,
        percentage: 0 // Will be calculated later
      };
    });
    
    // Sort by size (largest first)
    fileSizes.sort((a, b) => b.size - a.size);
    
    // Calculate percentages
    fileSizes.forEach(file => {
      file.percentage = ((file.size / totalSize) * 100).toFixed(1);
    });
    
    console.log('📊 File Sizes (sorted by size):');
    console.log('─'.repeat(80));
    console.log('File'.padEnd(50) + 'Size (KB)'.padEnd(12) + 'Gzip (KB)'.padEnd(12) + '%');
    console.log('─'.repeat(80));
    
    fileSizes.forEach(({ file, size, gzipSize, percentage }) => {
      console.log(
        file.padEnd(50) + 
        size.toString().padEnd(12) + 
        gzipSize.toFixed(2).padEnd(12) + 
        percentage + '%'
      );
    });
    
    console.log('─'.repeat(80));
    console.log(
      'TOTAL'.padEnd(50) + 
      totalSize.toFixed(2).padEnd(12) + 
      totalGzipSize.toFixed(2).padEnd(12) + 
      '100%'
    );
    
    console.log('\n🎯 Performance Insights:');
    console.log('─'.repeat(40));
    
    const largeFiles = fileSizes.filter(f => f.size > 100);
    if (largeFiles.length > 0) {
      console.log('⚠️  Large files (>100KB):');
      largeFiles.forEach(f => {
        console.log(`   • ${f.file}: ${f.size}KB (${f.percentage}%)`);
      });
    }
    
    const vendorFiles = fileSizes.filter(f => 
      f.file.includes('vendor') || 
      f.file.includes('react') || 
      f.file.includes('tanstack')
    );
    
    if (vendorFiles.length > 0) {
      console.log('\n📚 Vendor files:');
      vendorFiles.forEach(f => {
        console.log(`   • ${f.file}: ${f.size}KB (${f.percentage}%)`);
      });
    }
    
    console.log(`\n✅ Total bundle size: ${totalSize.toFixed(2)}KB (${totalGzipSize.toFixed(2)}KB gzipped)`);
    
    // Performance recommendations
    console.log('\n💡 Recommendations:');
    console.log('─'.repeat(40));
    
    if (totalSize > 500) {
      console.log('⚠️  Consider further code splitting for files >100KB');
    }
    
    if (largeFiles.length > 3) {
      console.log('⚠️  Consider lazy loading for large components');
    }
    
    console.log('✅ Bundle size is well optimized!');
    
  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message);
    process.exit(1);
  }
}

analyzeBundle();