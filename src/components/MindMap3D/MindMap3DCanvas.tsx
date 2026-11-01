import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HistoryNode } from '../../data/historyData';

interface MindMap3DCanvasProps {
  data: HistoryNode;
  selectedNodeId: string;
  expandedNodeIds: Set<string>;
  onSelectNode: (node: HistoryNode) => void;
  onToggleExpand: (nodeId: string) => void;
  focusedPeriodFilter?: 'all' | 'ancient' | 'medieval' | 'modern';
  searchHighlightedId?: string | null;
}

interface Graph3DNode {
  data: HistoryNode;
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  radius: number;
  color: THREE.Color;
  level: number;
  parentId: string | null;
  mesh?: THREE.Group;
  screenPos?: { x: number; y: number; visible: boolean };
}

interface Graph3DEdge {
  sourceId: string;
  targetId: string;
  sourcePos: THREE.Vector3;
  targetPos: THREE.Vector3;
  color: THREE.Color;
  lineMesh?: THREE.Line;
}

export const MindMap3DCanvas: React.FC<MindMap3DCanvasProps> = ({
  data,
  selectedNodeId,
  expandedNodeIds,
  onSelectNode,
  onToggleExpand,
  focusedPeriodFilter = 'all',
  searchHighlightedId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<HistoryNode | null>(null);
  const [hoverScreenPos, setHoverScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [screenLabels, setScreenLabels] = useState<Array<{
    node: HistoryNode;
    x: number;
    y: number;
    isExpanded: boolean;
    hasChildren: boolean;
    isSelected: boolean;
    isSearchMatch: boolean;
    color: string;
  }>>([]);

  // Mutable Three.js refs that shouldn't trigger React renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodesMapRef = useRef<Map<string, Graph3DNode>>(new Map());
  const edgesMapRef = useRef<Graph3DEdge[]>([]);
  const nodeMeshesGroupRef = useRef<THREE.Group | null>(null);
  const edgeLinesGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(-999, -999));
  const isTransitioningRef = useRef<boolean>(false);
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraPositionTargetRef = useRef<THREE.Vector3 | null>(null);

  // Helper to layout nodes in 3D radial space
  const compute3DLayout = useCallback((
    root: HistoryNode,
    expandedSet: Set<string>,
    periodFilter: string
  ): { nodes: Map<string, Graph3DNode>; edges: Graph3DEdge[] } => {
    const nodes = new Map<string, Graph3DNode>();
    const edges: Graph3DEdge[] = [];

    // Root node at center
    const rootColor = new THREE.Color('#38bdf8');
    nodes.set(root.id, {
      data: root,
      position: new THREE.Vector3(0, 0, 0),
      targetPosition: new THREE.Vector3(0, 0, 0),
      radius: 3.2,
      color: rootColor,
      level: 0,
      parentId: null,
    });

    if (!root.children) return { nodes, edges };

    // Filter main branches if a specific period is selected
    const primaryChildren = root.children.filter(child => {
      if (periodFilter === 'all') return true;
      return child.period === periodFilter;
    });

    const primaryCount = primaryChildren.length;
    const eraRadius = 24;

    primaryChildren.forEach((eraNode, eraIdx) => {
      // Position 3 main branches around root
      const angle = (eraIdx / primaryCount) * Math.PI * 2 - Math.PI / 2;
      const eraX = Math.cos(angle) * eraRadius;
      const eraZ = Math.sin(angle) * eraRadius;
      const eraY = (eraIdx % 2 === 0 ? 1 : -1) * 2;

      const eraColor = new THREE.Color(
        eraNode.period === 'ancient' ? '#0d9488' :
        eraNode.period === 'medieval' ? '#2563eb' : '#d97706'
      );

      const eraPos = new THREE.Vector3(eraX, eraY, eraZ);

      nodes.set(eraNode.id, {
        data: eraNode,
        position: eraPos,
        targetPosition: eraPos,
        radius: 2.4,
        color: eraColor,
        level: 1,
        parentId: root.id,
      });

      edges.push({
        sourceId: root.id,
        targetId: eraNode.id,
        sourcePos: new THREE.Vector3(0, 0, 0),
        targetPos: eraPos,
        color: eraColor,
      });

      // If era is expanded, layout its chapters
      if (expandedSet.has(eraNode.id) && eraNode.children) {
        const chapterCount = eraNode.children.length;
        const chapterDist = 18;

        eraNode.children.forEach((chapNode, chapIdx) => {
          // Spread in an arc oriented outward from era node
          const spreadAngle = 1.35; // ~77 degrees spread
          const subAngle = angle - spreadAngle / 2 + (spreadAngle * (chapIdx + 0.5)) / chapterCount;
          const chapX = eraX + Math.cos(subAngle) * chapterDist;
          const chapZ = eraZ + Math.sin(subAngle) * chapterDist;
          const chapY = eraY + (chapIdx - chapterCount / 2) * 3;

          const chapColor = new THREE.Color(
            chapNode.id === 'prehistory' ? '#14b8a6' :
            chapNode.period === 'ancient' ? '#0891b2' :
            chapNode.period === 'medieval' ? '#3b82f6' : '#f59e0b'
          );

          const chapPos = new THREE.Vector3(chapX, chapY, chapZ);

          nodes.set(chapNode.id, {
            data: chapNode,
            position: chapPos,
            targetPosition: chapPos,
            radius: 1.8,
            color: chapColor,
            level: 2,
            parentId: eraNode.id,
          });

          edges.push({
            sourceId: eraNode.id,
            targetId: chapNode.id,
            sourcePos: eraPos,
            targetPos: chapPos,
            color: chapColor,
          });

          // Level 3: Periods/Cultures (e.g. Paleolithic, Mesolithic, Neolithic, Chalcolithic)
          if (expandedSet.has(chapNode.id) && chapNode.children) {
            const periodCount = chapNode.children.length;
            const periodDist = 14;

            chapNode.children.forEach((subNode, subIdx) => {
              const subSpread = 1.2;
              const periodAngle = subAngle - subSpread / 2 + (subSpread * (subIdx + 0.5)) / periodCount;
              const subX = chapX + Math.cos(periodAngle) * periodDist;
              const subZ = chapZ + Math.sin(periodAngle) * periodDist;
              const subY = chapY + (subIdx - periodCount / 2) * 2.5;

              const subColor = new THREE.Color(
                subNode.id === 'paleolithic' ? '#059669' :
                subNode.id === 'mesolithic' ? '#10b981' :
                subNode.id === 'neolithic' ? '#14b8a6' :
                subNode.id === 'chalcolithic' ? '#0284c7' :
                subNode.id === 'indian-archaeology' ? '#9333ea' : '#475569'
              );

              const subPos = new THREE.Vector3(subX, subY, subZ);

              nodes.set(subNode.id, {
                data: subNode,
                position: subPos,
                targetPosition: subPos,
                radius: 1.4,
                color: subColor,
                level: 3,
                parentId: chapNode.id,
              });

              edges.push({
                sourceId: chapNode.id,
                targetId: subNode.id,
                sourcePos: chapPos,
                targetPos: subPos,
                color: subColor,
              });

              // Level 4: Subcultures/Rulers (e.g. Malwa, Jorwe, Kayatha, Ahar)
              if (expandedSet.has(subNode.id) && subNode.children) {
                const leafCount = subNode.children.length;
                const leafDist = 11;

                subNode.children.forEach((leafNode, leafIdx) => {
                  const leafAngle = periodAngle - 0.8 + (1.6 * (leafIdx + 0.5)) / leafCount;
                  const leafX = subX + Math.cos(leafAngle) * leafDist;
                  const leafZ = subZ + Math.sin(leafAngle) * leafDist;
                  const leafY = subY + (leafIdx - leafCount / 2) * 2;

                  const leafColor = new THREE.Color(
                    leafNode.id === 'malwa-culture' ? '#0284c7' :
                    leafNode.id === 'jorwe-culture' ? '#2563eb' :
                    leafNode.id === 'kayatha-culture' ? '#0d9488' : '#d97706'
                  );

                  const leafPos = new THREE.Vector3(leafX, leafY, leafZ);

                  nodes.set(leafNode.id, {
                    data: leafNode,
                    position: leafPos,
                    targetPosition: leafPos,
                    radius: 1.1,
                    color: leafColor,
                    level: 4,
                    parentId: subNode.id,
                  });

                  edges.push({
                    sourceId: subNode.id,
                    targetId: leafNode.id,
                    sourcePos: subPos,
                    targetPos: leafPos,
                    color: leafColor,
                  });
                });
              }
            });
          }
        });
      }
    });

    return { nodes, edges };
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL
    const gl = document.createElement('canvas').getContext('webgl2');
    let isSoftwareGl = false;
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } else {
      isSoftwareGl = true;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080c16');
    scene.fog = new THREE.FogExp2('#080c16', 0.007);
    sceneRef.current = scene;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.5, 500);
    camera.position.set(0, 32, 68);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 10;
    controls.maxDistance = 220;
    controls.maxPolarAngle = Math.PI / 2 + 0.15; // Don't flip upside down
    controlsRef.current = controls;

    // Studio Environment lighting (RoomEnvironment + PMREM)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-Point Light Rig
    const ambientLight = new THREE.AmbientLight('#94a3b8', 0.4);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight('#38bdf8', '#0f172a', 0.6);
    scene.add(hemisphereLight);

    const dirLight = new THREE.DirectionalLight('#fef08a', 1.4);
    dirLight.position.set(30, 45, 25);
    dirLight.castShadow = !isSoftwareGl;
    if (dirLight.shadow) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 150;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    scene.add(dirLight);

    const blueFillLight = new THREE.PointLight('#38bdf8', 1.5, 120);
    blueFillLight.position.set(-30, 20, -30);
    scene.add(blueFillLight);

    // Cosmic background particle stars (Instanced/Shared Points)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 350;
      starPos[i + 1] = (Math.random() - 0.5) * 200;
      starPos[i + 2] = (Math.random() - 0.5) * 350;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: '#94a3b8',
      size: 1.2,
      transparent: true,
      opacity: 0.5,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Groups for nodes and lines
    const nodeMeshesGroup = new THREE.Group();
    scene.add(nodeMeshesGroup);
    nodeMeshesGroupRef.current = nodeMeshesGroup;

    const edgeLinesGroup = new THREE.Group();
    scene.add(edgeLinesGroup);
    edgeLinesGroupRef.current = edgeLinesGroup;

    // Window resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera transition if active
      if (isTransitioningRef.current && cameraPositionTargetRef.current) {
        camera.position.lerp(cameraPositionTargetRef.current, 0.08);
        controls.target.lerp(cameraTargetRef.current, 0.08);
        controls.update();

        if (camera.position.distanceTo(cameraPositionTargetRef.current) < 0.2) {
          isTransitioningRef.current = false;
        }
      } else {
        controls.update();
      }

      // Rotate subtle starfield
      starPoints.rotation.y += delta * 0.015;

      // Update projected 2D screen positions for labels
      const tempVec = new THREE.Vector3();
      const labels: Array<{
        node: HistoryNode;
        x: number;
        y: number;
        isExpanded: boolean;
        hasChildren: boolean;
        isSelected: boolean;
        isSearchMatch: boolean;
        color: string;
      }> = [];

      nodesMapRef.current.forEach((gNode) => {
        tempVec.copy(gNode.position);
        tempVec.project(camera);

        const isBehind = tempVec.z > 1;
        const screenX = ((tempVec.x + 1) * width) / 2;
        const screenY = ((-tempVec.y + 1) * height) / 2;

        if (!isBehind && screenX > -50 && screenX < width + 50 && screenY > -50 && screenY < height + 50) {
          labels.push({
            node: gNode.data,
            x: screenX,
            y: screenY,
            isExpanded: expandedNodeIds.has(gNode.data.id),
            hasChildren: Boolean(gNode.data.children && gNode.data.children.length > 0),
            isSelected: gNode.data.id === selectedNodeId,
            isSearchMatch: gNode.data.id === searchHighlightedId,
            color: `#${gNode.color.getHexString()}`,
          });
        }
      });

      setScreenLabels(labels);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Graph 3D Objects when layout, expanded nodes, or filters change
  useEffect(() => {
    if (!sceneRef.current || !nodeMeshesGroupRef.current || !edgeLinesGroupRef.current) return;

    const { nodes, edges } = compute3DLayout(data, expandedNodeIds, focusedPeriodFilter);
    nodesMapRef.current = nodes;
    edgesMapRef.current = edges;

    const nodeGroup = nodeMeshesGroupRef.current;
    const edgeGroup = edgeLinesGroupRef.current;

    // Clear previous 3D objects cleanly
    while (nodeGroup.children.length > 0) {
      const obj = nodeGroup.children[0];
      nodeGroup.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    while (edgeGroup.children.length > 0) {
      const obj = edgeGroup.children[0];
      edgeGroup.remove(obj);
      if (obj instanceof THREE.Line) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    }

    // Build 3D nodes
    nodes.forEach((gNode) => {
      const isSelected = gNode.data.id === selectedNodeId;
      const isSearchMatch = gNode.data.id === searchHighlightedId;
      const nodeGroupObj = new THREE.Group();
      nodeGroupObj.position.copy(gNode.position);
      nodeGroupObj.userData = { nodeId: gNode.data.id, data: gNode.data };

      // Core Sphere
      const sphereGeo = new THREE.SphereGeometry(gNode.radius, 32, 24);
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: gNode.color,
        roughness: 0.25,
        metalness: 0.65,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        emissive: isSelected ? new THREE.Color('#38bdf8') : isSearchMatch ? new THREE.Color('#fbbf24') : gNode.color,
        emissiveIntensity: isSelected ? 0.8 : isSearchMatch ? 1.0 : 0.2,
      });

      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.castShadow = true;
      sphereMesh.receiveShadow = true;
      nodeGroupObj.add(sphereMesh);

      // Outer Glowing Ring/Orbital Accent
      const ringGeo = new THREE.TorusGeometry(gNode.radius * 1.35, gNode.radius * 0.08, 16, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: isSelected ? '#38bdf8' : gNode.color,
        emissive: isSelected ? '#38bdf8' : gNode.color,
        emissiveIntensity: isSelected ? 0.9 : 0.4,
        roughness: 0.3,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      nodeGroupObj.add(ringMesh);

      // Selected / Match Pulsing Halo
      if (isSelected || isSearchMatch) {
        const haloGeo = new THREE.SphereGeometry(gNode.radius * 1.6, 16, 16);
        const haloMat = new THREE.MeshBasicMaterial({
          color: isSearchMatch ? '#fbbf24' : '#38bdf8',
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        nodeGroupObj.add(haloMesh);
      }

      nodeGroup.add(nodeGroupObj);
      gNode.mesh = nodeGroupObj;
    });

    // Build 3D connecting edge lines
    edges.forEach((edge) => {
      const points = [edge.sourcePos, edge.targetPos];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: edge.color,
        transparent: true,
        opacity: 0.65,
        linewidth: 1.5,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      edgeGroup.add(line);
      edge.lineMesh = line;
    });
  }, [data, expandedNodeIds, focusedPeriodFilter, selectedNodeId, searchHighlightedId, compute3DLayout]);

  // Center camera on search match or selected node
  const focusOnNode = useCallback((nodeId: string) => {
    const targetNode = nodesMapRef.current.get(nodeId);
    if (!targetNode || !cameraRef.current || !controlsRef.current) return;

    isTransitioningRef.current = true;
    cameraTargetRef.current.copy(targetNode.position);

    // Compute offset camera position
    const offsetDir = new THREE.Vector3(0, 8, 22);
    cameraPositionTargetRef.current = targetNode.position.clone().add(offsetDir);
  }, []);

  // When searchHighlightedId changes, focus camera
  useEffect(() => {
    if (searchHighlightedId) {
      focusOnNode(searchHighlightedId);
    }
  }, [searchHighlightedId, focusOnNode]);

  // Reset Camera View
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    isTransitioningRef.current = true;
    cameraTargetRef.current.set(0, 0, 0);
    cameraPositionTargetRef.current = new THREE.Vector3(0, 32, 68);
  };

  // Raycasting for node hover / click detection
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !cameraRef.current || !nodeMeshesGroupRef.current) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseRef.current.set(x, y);

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(nodeMeshesGroupRef.current.children, true);

    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !topObj.userData?.nodeId && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj?.userData?.data) {
        setHoveredNode(topObj.userData.data);
        setHoverScreenPos({ x: e.clientX, y: e.clientY });
        container.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredNode(null);
    setHoverScreenPos(null);
    container.style.cursor = 'default';
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Single click handler
    const container = containerRef.current;
    if (!container || !cameraRef.current || !nodeMeshesGroupRef.current) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseRef.current.set(x, y);

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(nodeMeshesGroupRef.current.children, true);

    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !topObj.userData?.nodeId && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj?.userData?.data) {
        const clickedData: HistoryNode = topObj.userData.data;
        onSelectNode(clickedData);
        if (clickedData.children && clickedData.children.length > 0) {
          onToggleExpand(clickedData.id);
        }
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !cameraRef.current || !nodeMeshesGroupRef.current) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseRef.current.set(x, y);

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(nodeMeshesGroupRef.current.children, true);

    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !topObj.userData?.nodeId && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj?.userData?.nodeId) {
        focusOnNode(topObj.userData.nodeId);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#080c16]"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* 2D Projected HTML Labels for High Readability in Hindi */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {screenLabels.map((item) => (
          <div
            key={item.node.id}
            style={{
              transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
              willChange: 'transform',
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(item.node);
                if (item.hasChildren) {
                  onToggleExpand(item.node.id);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                focusOnNode(item.node.id);
              }}
              className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 shadow-md ${
                item.isSelected
                  ? 'bg-sky-500 text-white ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-950 scale-105'
                  : item.isSearchMatch
                  ? 'bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-950 animate-bounce'
                  : 'bg-slate-900/90 text-slate-100 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500'
              }`}
            >
              {/* Expand/Collapse badge */}
              {item.hasChildren && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(item.node.id);
                  }}
                  className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold ${
                    item.isExpanded ? 'bg-slate-700 text-slate-300' : 'bg-emerald-600 text-white'
                  }`}
                  title={item.isExpanded ? 'शाखाएं समेटें' : 'शाखाएं खोलें'}
                >
                  {item.isExpanded ? '−' : '+'}
                </span>
              )}

              <span className="truncate max-w-[140px] md:max-w-[200px]">
                {item.node.title}
              </span>

              {item.node.sourcePages && item.node.sourcePages.length > 0 && (
                <span className="text-[10px] opacity-75 text-amber-300/90 font-mono">
                  p.{item.node.sourcePages[0]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hover preview tooltip */}
      {hoveredNode && hoverScreenPos && (
        <div
          style={{
            left: `${hoverScreenPos.x + 16}px`,
            top: `${hoverScreenPos.y + 16}px`,
          }}
          className="fixed z-50 pointer-events-none bg-slate-900/95 border border-slate-700 text-slate-100 p-3 rounded-lg shadow-2xl max-w-xs text-xs backdrop-blur-md"
        >
          <div className="font-semibold text-sky-400 text-sm mb-1">{hoveredNode.title}</div>
          {hoveredNode.dates && (
            <div className="text-amber-400 font-mono text-[11px] mb-1.5">{hoveredNode.dates}</div>
          )}
          <p className="line-clamp-2 text-slate-300 text-[11px] leading-relaxed">
            {hoveredNode.description}
          </p>
          <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>पृष्ठ: {hoveredNode.sourcePages.join(', ')}</span>
            <span className="text-sky-300">डबल-क्लिक: कैमरा फोकस</span>
          </div>
        </div>
      )}

      {/* Viewport instruction badge */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 flex items-center gap-2 text-xs text-slate-400 bg-slate-950/70 border border-slate-800/80 px-3 py-1.5 rounded-md">
        <span className="w-2 h-2 rounded-full bg-teal-400"></span>
        <span>3D ज्ञान ब्रह्मांड · ड्रैग: घुमाएं · स्क्रोल: ज़ूम · डबल-क्लिक: फोकस</span>
      </div>
    </div>
  );
};
