const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Dismiss launcher overlay
    await page.evaluate(() => {
        if (window.desktopLauncher && typeof window.desktopLauncher.hideLauncher === 'function') {
            window.desktopLauncher.hideLauncher();
        }
        const overlay = document.getElementById('desktop-launcher-overlay');
        if (overlay) overlay.style.display = 'none';
        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');
    });

    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });

    // PROOF 1: Avatar Face & Hair (Mouth locked closed, soft anime hair sheen)
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        ow.isCinematicCamera = true;

        const head = ow.retargeter.mappedBones.Head || ow.playerMesh;
        const hp = new THREE.Vector3();
        head.getWorldPosition(hp);

        // Close-up on face and hair
        ow.camera.position.set(hp.x - 0.20, hp.y + 0.05, hp.z + 0.45);
        ow.camera.lookAt(hp.x, hp.y + 0.02, hp.z);
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'proof_1_avatar_face_and_hair.png' });

    // PROOF 2: Hand Grip & Finger Curl (Fingers wrapping can, zero hyperextension)
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        ow.equipHandheldItem({
            id: 'drink_green_tea',
            name: 'Japanese Green Tea',
            gripProfile: 'small_can',
            handPose: 'small_can'
        });

        const hand = ow.retargeter.mappedBones.RightHand;
        const hp = new THREE.Vector3();
        hand.getWorldPosition(hp);

        // Direct clear view of hand holding can
        ow.camera.position.set(hp.x - 0.42, hp.y + 0.05, hp.z + 0.38);
        ow.camera.lookAt(hp.x, hp.y, hp.z);
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: 'proof_2_hand_grip_wrapping.png' });

    // PROOF 3: Beach Ocean Specular & Bloom Glare (Gentle soft shimmer, no white glare blowout)
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        // Teleport to coastal overlook / beach
        ow.playerMesh.position.set(5.0, 1.2, 58.0);
        ow.camera.position.set(5.0, 3.5, 52.0);
        ow.camera.lookAt(5.0, 0.5, 95.0);
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'proof_3_ocean_reflection_softness.png' });

    // PROOF 4: Mountain & Rock Solid Colliders
    const collisionResults = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const colSys = ow.collisionSystem;

        // Test 1: Trying to move into Northern Alpine Wall z = -75.0 (boundary is z = -68.0)
        const attemptedWall = { x: 0.0, z: -75.0 };
        const resolvedWall = colSys.resolveCollision(attemptedWall.x, attemptedWall.z, 0.45);

        // Test 2: Trying to walk into Alpine Rock Massif #3 at (26.0, -62.0), radius ~4.4m
        const attemptedRock = { x: 26.0, z: -62.0 };
        const resolvedRock = colSys.resolveCollision(attemptedRock.x, attemptedRock.z, 0.45);

        // Test 3: Trying to walk into River Boulder #1 at (11.0, -18.0), radius ~1.4m
        const attemptedBoulder = { x: 11.0, z: -18.0 };
        const resolvedBoulder = colSys.resolveCollision(attemptedBoulder.x, attemptedBoulder.z, 0.45);

        return {
            wall: { attempted: attemptedWall, resolved: resolvedWall, blocked: resolvedWall.z > -68.0 },
            rock: { attempted: attemptedRock, resolved: resolvedRock, blocked: (Math.hypot(resolvedRock.x - 26.0, resolvedRock.z - (-62.0)) > 3.5) },
            boulder: { attempted: attemptedBoulder, resolved: resolvedBoulder, blocked: (Math.hypot(resolvedBoulder.x - 11.0, resolvedBoulder.z - (-18.0)) > 1.2) },
            totalRockColliders: colSys.rockColliders ? colSys.rockColliders.length : 0
        };
    });
    console.log('COLLISION TEST RESULTS:', JSON.stringify(collisionResults, null, 2));

    // Position camera looking at the Northern Alpine mountain massifs
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.playerMesh.position.set(0.0, 4.0, -50.0);
        ow.camera.position.set(0.0, 6.0, -40.0);
        ow.camera.lookAt(0.0, 10.0, -90.0);
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'proof_4_alpine_mountain_solid_wall.png' });

    await browser.close();
    console.log('ALL PROOF SCREENSHOTS COMPLETED');
})();
