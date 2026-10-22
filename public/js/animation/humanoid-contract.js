/**
 * UNIVERSAL HUMANOID AVATAR CONTRACT & BONE MAPPING DICTIONARY
 * Implements Section 24, 25, and 26 of TeleTerm Living Open World Master Spec v3.
 * Normalizes VRoid, VRM, Mixamo, and standard glTF 2.0 humanoid skeletons
 * into unified semantic humanoid bone targets.
 */

export const SEMANTIC_BONES = [
    'Hips',
    'Spine',
    'Chest',
    'UpperChest',
    'Neck',
    'Head',
    'LeftShoulder',
    'LeftUpperArm',
    'LeftLowerArm',
    'LeftHand',
    'RightShoulder',
    'RightUpperArm',
    'RightLowerArm',
    'RightHand',
    'LeftUpperLeg',
    'LeftLowerLeg',
    'LeftFoot',
    'LeftToes',
    'RightUpperLeg',
    'RightLowerLeg',
    'RightFoot',
    'RightToes'
];

export const BONE_NAME_PATTERNS = {
    Hips: ['J_Bip_C_Hips', 'mixamorig:Hips', 'mixamorigHips', 'Hips', 'pelvis', 'root_motion', 'hip'],
    Spine: ['J_Bip_C_Spine', 'mixamorig:Spine', 'mixamorigSpine', 'Spine', 'spine_01', 'spine'],
    Chest: ['J_Bip_C_Chest', 'mixamorig:Spine1', 'mixamorigSpine1', 'Chest', 'spine_02', 'chest'],
    UpperChest: ['J_Bip_C_UpperChest', 'mixamorig:Spine2', 'mixamorigSpine2', 'UpperChest', 'spine_03', 'upperchest', 'upper_chest'],
    Neck: ['J_Bip_C_Neck', 'mixamorig:Neck', 'mixamorigNeck', 'Neck', 'neck_01', 'neck'],
    Head: ['J_Bip_C_Head', 'mixamorig:Head', 'mixamorigHead', 'Head', 'head'],

    LeftShoulder: ['J_Bip_L_Shoulder', 'mixamorig:LeftShoulder', 'mixamorigLeftShoulder', 'LeftShoulder', 'shoulder.L', 'clavicle.L', 'leftshoulder'],
    LeftUpperArm: ['J_Bip_L_UpperArm', 'mixamorig:LeftArm', 'mixamorigLeftArm', 'LeftUpperArm', 'upperarm.L', 'arm.L', 'upper_arm.L', 'leftupperarm', 'leftarm'],
    LeftLowerArm: ['J_Bip_L_LowerArm', 'mixamorig:LeftForeArm', 'mixamorigLeftForeArm', 'LeftLowerArm', 'forearm.L', 'lowerarm.L', 'lower_arm.L', 'leftlowerarm', 'leftforearm'],
    LeftHand: ['J_Bip_L_Hand', 'mixamorig:LeftHand', 'mixamorigLeftHand', 'LeftHand', 'hand.L', 'lefthand'],

    RightShoulder: ['J_Bip_R_Shoulder', 'mixamorig:RightShoulder', 'mixamorigRightShoulder', 'RightShoulder', 'shoulder.R', 'clavicle.R', 'rightshoulder'],
    RightUpperArm: ['J_Bip_R_UpperArm', 'mixamorig:RightArm', 'mixamorigRightArm', 'RightUpperArm', 'upperarm.R', 'arm.R', 'upper_arm.R', 'rightupperarm', 'rightarm'],
    RightLowerArm: ['J_Bip_R_LowerArm', 'mixamorig:RightForeArm', 'mixamorigRightForeArm', 'RightLowerArm', 'forearm.R', 'lowerarm.R', 'lower_arm.R', 'rightlowerarm', 'rightforearm'],
    RightHand: ['J_Bip_R_Hand', 'mixamorig:RightHand', 'mixamorigRightHand', 'RightHand', 'hand.R', 'righthand'],

    LeftUpperLeg: ['J_Bip_L_UpperLeg', 'mixamorig:LeftUpLeg', 'mixamorigLeftUpLeg', 'LeftUpperLeg', 'thigh.L', 'leg.L', 'upper_leg.L', 'leftupperleg', 'leftupleg'],
    LeftLowerLeg: ['J_Bip_L_LowerLeg', 'mixamorig:LeftLeg', 'mixamorigLeftLeg', 'LeftLowerLeg', 'calf.L', 'shin.L', 'lowerleg.L', 'lower_leg.L', 'leftlowerleg', 'leftleg'],
    LeftFoot: ['J_Bip_L_Foot', 'mixamorig:LeftFoot', 'mixamorigLeftFoot', 'LeftFoot', 'foot.L', 'leftfoot'],
    LeftToes: ['J_Bip_L_ToeBase', 'mixamorig:LeftToeBase', 'mixamorigLeftToeBase', 'LeftToes', 'toe.L', 'lefttoebase', 'lefttoes'],

    RightUpperLeg: ['J_Bip_R_UpperLeg', 'mixamorig:RightUpLeg', 'mixamorigRightUpLeg', 'RightUpperLeg', 'thigh.R', 'leg.R', 'upper_leg.R', 'rightupperleg', 'rightupleg'],
    RightLowerLeg: ['J_Bip_R_LowerLeg', 'mixamorig:RightLeg', 'mixamorigRightLeg', 'RightLowerLeg', 'calf.R', 'shin.R', 'lowerleg.R', 'lower_leg.R', 'rightlowerleg', 'rightleg'],
    RightFoot: ['J_Bip_R_Foot', 'mixamorig:RightFoot', 'mixamorigRightFoot', 'RightFoot', 'foot.R', 'rightfoot'],
    RightToes: ['J_Bip_R_ToeBase', 'mixamorig:RightToeBase', 'mixamorigRightToeBase', 'RightToes', 'toe.R', 'righttoebase', 'righttoes']
};

export class HumanoidContract {
    /**
     * Inspects a Three.js Object3D / Scene hierarchy and maps all found bones
     * to normalized semantic bone names.
     */
    static mapSkeleton(rootModel) {
        const foundBones = {};
        const mappedSemantic = {};

        // 1. Gather all actual Bone objects
        rootModel.traverse(child => {
            if (child.isBone) {
                foundBones[child.name] = child;
            }
        });

        // 2. Resolve semantic bones via pattern matching
        for (const semantic of SEMANTIC_BONES) {
            const patterns = BONE_NAME_PATTERNS[semantic] || [];
            let matchedBone = null;

            for (const pat of patterns) {
                // Exact match
                if (foundBones[pat]) {
                    matchedBone = foundBones[pat];
                    break;
                }
                // Case-insensitive / partial match
                const lowerPat = pat.toLowerCase();
                for (const name in foundBones) {
                    if (name.toLowerCase() === lowerPat || name.toLowerCase().endsWith(lowerPat)) {
                        matchedBone = foundBones[name];
                        break;
                    }
                }
                if (matchedBone) break;
            }

            if (matchedBone) {
                mappedSemantic[semantic] = matchedBone;
            }
        }

        // Return mapping and coverage report
        const matchedCount = Object.keys(mappedSemantic).length;
        const isCompatible = mappedSemantic.Hips && mappedSemantic.Head &&
                             mappedSemantic.LeftUpperLeg && mappedSemantic.RightUpperLeg;

        return {
            mapped: mappedSemantic,
            allBones: foundBones,
            coverage: matchedCount / SEMANTIC_BONES.length,
            isCompatible: !!isCompatible,
            status: isCompatible ? (matchedCount >= 18 ? 'Compatible' : 'Compatible with adjustments') : 'Rejected'
        };
    }
}
