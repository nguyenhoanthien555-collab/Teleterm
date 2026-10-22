/**
 * Untrusted 3D Asset Validator Pipeline
 * TeleTerm Master Architecture v2 - Section 9.3, 9.4 & 25.5
 */

const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB
const GLTF_MAGIC = 0x46546C67; // 'glTF' in little-endian

class AssetValidator {
    /**
     * Validate buffer of uploaded .glb / .vrm
     */
    validateBuffer(buffer, originalFilename = '') {
        if (!buffer || !Buffer.isBuffer(buffer)) {
            return { valid: false, error: 'Empty or invalid file stream' };
        }

        // 1. Size constraint
        if (buffer.length > MAX_FILE_SIZE_BYTES) {
            return {
                valid: false,
                error: `Dung lượng file vượt quá giới hạn cho phép (${(buffer.length / 1024 / 1024).toFixed(1)}MB > 12MB). Vui lòng tối ưu lại model để tránh giật lag cho người chơi khác.`
            };
        }

        // 2. Minimum header check (12 bytes minimum for binary glTF)
        if (buffer.length < 12) {
            return { valid: false, error: 'File 3D bị lỗi hoặc hỏng header' };
        }

        // 3. Magic bytes verification (glTF binary)
        const magic = buffer.readUInt32LE(0);
        if (magic !== GLTF_MAGIC) {
            return {
                valid: false,
                error: 'Định dạng không hợp lệ. Chỉ chấp nhận model 3D nhị phân chuẩn .GLB hoặc .VRM từ VRoid Studio.'
            };
        }

        // 4. glTF Version check
        const version = buffer.readUInt32LE(4);
        if (version !== 2) {
            return { valid: false, error: `Phiên bản glTF v${version} không được hỗ trợ. Chỉ hỗ trợ glTF 2.0.` };
        }

        // 5. Total declared length check
        const declaredLength = buffer.readUInt32LE(8);
        if (declaredLength > buffer.length) {
            return { valid: false, error: 'File 3D bị cắt cụt (truncated buffer) trong quá trình upload.' };
        }

        return {
            valid: true,
            sizeBytes: buffer.length,
            version: 2,
            format: originalFilename.toLowerCase().endsWith('.vrm') ? 'vrm' : 'glb'
        };
    }
}

module.exports = new AssetValidator();
