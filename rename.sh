find . -type f -not -path "./node_modules/*" -exec grep -l "@cornerstonejs" {} \; | while read -r file; do
  sed -i '' \
    -e 's/@cornerstonejs\/core/@alireza-test-monorepo\/core/g' \
    -e 's/@cornerstonejs\/tools/@alireza-test-monorepo\/tools/g' \
    -e 's/@cornerstonejs\/streaming-image-volume-loader/@alireza-test-monorepo\/streaming-image-volume-loader/g' \
    -e 's/@cornerstonejs\/dicom-image-loader/@alireza-test-monorepo\/dicom-image-loader/g' \
    -e 's/@cornerstonejs\/adapters/@alireza-test-monorepo\/adapters/g' \
    "$file"
done
