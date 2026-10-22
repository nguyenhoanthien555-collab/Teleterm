const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });

    const info = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const mesh = ow.playerMesh;
        const submeshes = [];
        mesh.traverse(child => {
            if (child.isMesh) {
                const mat = child.material;
                submeshes.push({
                    meshName: child.name,
                    renderOrder: child.renderOrder,
                    matName: Array.isArray(mat) ? mat.map(m => m.name) : mat.name,
                    matColor: Array.isArray(mat) ? mat.map(m => m.color.getHexString()) : mat.color.getHexString(),
                    hasMap: Array.isArray(mat) ? mat.map(m => !!m.map) : !!mat.map,
                    emissive: Array.isArray(mat) ? mat.map(m => m.emissive?.getHexString()) : mat.emissive?.getHexString(),
                    emissiveIntensity: Array.isArray(mat) ? mat.map(m => m.emissiveIntensity) : mat.emissiveIntensity,
                    transparent: Array.isArray(mat) ? mat.map(m => m.transparent) : mat.transparent,
                    alphaTest: Array.isArray(mat) ? mat.map(m => m.alphaTest) : mat.alphaTest,
                    depthWrite: Array.isArray(mat) ? mat.map(m => m.depthWrite) : mat.depthWrite
                });
            }
        });

        // Finger bones check
        const retargeter = ow.retargeter;
        const fingers = {};
        for (const [k, bones] of Object.entries(retargeter.fingerBones)) {
            fingers[k] = bones.map(b => ({
                name: b.name,
                rotX: b.rotation.x.toFixed(3),
                rotY: b.rotation.y.toFixed(3),
                rotZ: b.rotation.z.toFixed(3)
            }));
        }

        return { submeshes, fingers, currentHandPose: retargeter.currentHandPose, handPoseCurl: retargeter.handPoseCurl };
    });

    console.log('--- SUBMESHES ---');
    console.log(JSON.stringify(info.submeshes, null, 2));
    console.log('--- FINGERS (before equip) ---');
    console.log(JSON.stringify(info.fingers, null, 2));

    // Now equip can
    const equipInfo = await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.equipHandheldItem({
            id: 'drink_green_tea',
            name: 'Japanese Green Tea',
            gripProfile: 'small_can',
            handPose: 'small_can'
        });
        ow.retargeter.setHandPose('small_can');
        ow.retargeter.update(0.1);
        ow.retargeter.update(0.1);
        ow.retargeter.update(0.1);

        const fingers = {};
        for (const [k, bones] of Object.entries(ow.retargeter.fingerBones)) {
            fingers[k] = bones.map(b => ({
                name: b.name,
                rotX: b.rotation.x.toFixed(3),
                rotY: b.rotation.y.toFixed(3),
                rotZ: b.rotation.z.toFixed(3)
            }));
        }

        const canMesh = ow.handheldItemMesh;
        const canWorldPos = new window.THREE.Vector3();
        canMesh.getWorldPosition(canWorldPos);

        const handBone = ow.retargeter.mappedBones.RightHand;
        const handWorldPos = new window.THREE.Vector3();
        handBone.getWorldPosition(handWorldPos);

        return {
            currentHandPose: ow.retargeter.currentHandPose,
            handPoseCurl: ow.retargeter.handPoseCurl,
            fingers,
            canPosLocal: canMesh.position,
            canRotLocal: [canMesh.rotation.x, canMesh.rotation.y, canMesh.rotation.z],
            canWorldPos,
            handWorldPos
        };
    });

    console.log('--- AFTER EQUIP CAN ---');
    console.log(JSON.stringify(equipInfo, null, 2));

    await browser.close();
})();
