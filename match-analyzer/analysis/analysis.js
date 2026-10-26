/**
 * Jerein Sam Thomas — Football Analytics Engine
 * Interactive Pitch Visualizer, Layer Engine, Radar Charts & Probability Simulator
 */

(function () {
  'use strict';

  // Global namespace for Football Analytics Engine
  window.FootballAnalytics = {
    initPitch: initPitch,
    initRollingXGChart: initRollingXGChart,
    initRadarChart: initRadarChart,
    initISLSimulator: initISLSimulator
  };

  /* ==========================================================================
     1. ACCURATE TOP-DOWN FOOTBALL PITCH RENDERING & LAYER ENGINE
     Pitch Standard: 105m length x 68m width (Coordinates 0..105, 0..68)
     ========================================================================== */
  function initPitch(containerId, matchData) {
    const container = document.getElementById(containerId);
    if (!container || !matchData) return;

    // Pitch coordinate scale
    const pitchLength = 105;
    const pitchWidth = 68;

    // Active filters
    const activeLayers = {
      shots: true,
      passes: true,
      positions: false,
      recoveries: false,
      heatmap: false
    };

    let activeTeamFilter = 'all'; // 'all', 'home', 'away'
    let activeHalfFilter = 'all'; // 'all', '1', '2'

    // Create SVG Canvas structure
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${pitchLength} ${pitchWidth}`);
    svg.setAttribute('class', 'pitch-svg-canvas');
    svg.setAttribute('aria-label', 'Interactive tactical football pitch diagram');

    // Tooltip Element
    const tooltip = document.createElement('div');
    tooltip.className = 'pitch-tooltip';
    container.appendChild(tooltip);

    // Draw Static Pitch Markings
    function drawPitchBase() {
      const defs = document.createElementNS(svgNS, 'defs');
      
      // Grass strip pattern
      const pattern = document.createElementNS(svgNS, 'pattern');
      pattern.setAttribute('id', 'pitchGrassPattern');
      pattern.setAttribute('width', '15');
      pattern.setAttribute('height', '68');
      pattern.setAttribute('patternUnits', 'userSpaceOnUse');

      const rectGrass = document.createElementNS(svgNS, 'rect');
      rectGrass.setAttribute('width', '7.5');
      rectGrass.setAttribute('height', '68');
      rectGrass.setAttribute('fill', 'rgba(255, 255, 255, 0.03)');
      pattern.appendChild(rectGrass);
      defs.appendChild(pattern);
      svg.appendChild(defs);

      // Pitch background
      const bg = document.createElementNS(svgNS, 'rect');
      bg.setAttribute('x', '0');
      bg.setAttribute('y', '0');
      bg.setAttribute('width', pitchLength.toString());
      bg.setAttribute('height', pitchWidth.toString());
      bg.setAttribute('fill', '#142E20');
      svg.appendChild(bg);

      // Striping overlay
      const stripOverlay = document.createElementNS(svgNS, 'rect');
      stripOverlay.setAttribute('x', '0');
      stripOverlay.setAttribute('y', '0');
      stripOverlay.setAttribute('width', pitchLength.toString());
      stripOverlay.setAttribute('height', pitchWidth.toString());
      stripOverlay.setAttribute('fill', 'url(#pitchGrassPattern)');
      svg.appendChild(stripOverlay);

      // Boundary touchlines (padding 3m on each side: pitch playing area 3..102, 3..65)
      // For clean mapping, pitch is 0 to 105 length, 0 to 68 width
      const pitchLinesGroup = document.createElementNS(svgNS, 'g');
      pitchLinesGroup.setAttribute('stroke', 'rgba(236, 227, 209, 0.7)');
      pitchLinesGroup.setAttribute('stroke-width', '0.6');
      pitchLinesGroup.setAttribute('fill', 'none');

      // Outer boundary
      const boundary = document.createElementNS(svgNS, 'rect');
      boundary.setAttribute('x', '3');
      boundary.setAttribute('y', '3');
      boundary.setAttribute('width', '99');
      boundary.setAttribute('height', '62');
      pitchLinesGroup.appendChild(boundary);

      // Halfway line
      const halfway = document.createElementNS(svgNS, 'line');
      halfway.setAttribute('x1', '52.5');
      halfway.setAttribute('y1', '3');
      halfway.setAttribute('x2', '52.5');
      halfway.setAttribute('y2', '65');
      pitchLinesGroup.appendChild(halfway);

      // Centre Circle (radius 9.15m)
      const centerCircle = document.createElementNS(svgNS, 'circle');
      centerCircle.setAttribute('cx', '52.5');
      centerCircle.setAttribute('cy', '34');
      centerCircle.setAttribute('r', '9.15');
      pitchLinesGroup.appendChild(centerCircle);

      const centerDot = document.createElementNS(svgNS, 'circle');
      centerDot.setAttribute('cx', '52.5');
      centerDot.setAttribute('cy', '34');
      centerDot.setAttribute('r', '0.6');
      centerDot.setAttribute('fill', 'rgba(236, 227, 209, 0.7)');
      pitchLinesGroup.appendChild(centerDot);

      // Left Penalty Area (16.5m from goal line, width 40.3m -> y from 13.85 to 54.15)
      const leftPenArea = document.createElementNS(svgNS, 'rect');
      leftPenArea.setAttribute('x', '3');
      leftPenArea.setAttribute('y', '13.85');
      leftPenArea.setAttribute('width', '16.5');
      leftPenArea.setAttribute('height', '40.3');
      pitchLinesGroup.appendChild(leftPenArea);

      // Left 6-yard box (5.5m deep, 18.3m wide -> y from 24.85 to 43.15)
      const leftGoalBox = document.createElementNS(svgNS, 'rect');
      leftGoalBox.setAttribute('x', '3');
      leftGoalBox.setAttribute('y', '24.85');
      leftGoalBox.setAttribute('width', '5.5');
      leftGoalBox.setAttribute('height', '18.3');
      pitchLinesGroup.appendChild(leftGoalBox);

      // Left Penalty spot & Arc
      const leftPenSpot = document.createElementNS(svgNS, 'circle');
      leftPenSpot.setAttribute('cx', '14');
      leftPenSpot.setAttribute('cy', '34');
      leftPenSpot.setAttribute('r', '0.6');
      leftPenSpot.setAttribute('fill', 'rgba(236, 227, 209, 0.7)');
      pitchLinesGroup.appendChild(leftPenSpot);

      const leftArc = document.createElementNS(svgNS, 'path');
      leftArc.setAttribute('d', 'M 19.5 27.5 A 9.15 9.15 0 0 1 19.5 40.5');
      pitchLinesGroup.appendChild(leftArc);

      // Right Penalty Area
      const rightPenArea = document.createElementNS(svgNS, 'rect');
      rightPenArea.setAttribute('x', '85.5');
      rightPenArea.setAttribute('y', '13.85');
      rightPenArea.setAttribute('width', '16.5');
      rightPenArea.setAttribute('height', '40.3');
      pitchLinesGroup.appendChild(rightPenArea);

      // Right 6-yard box
      const rightGoalBox = document.createElementNS(svgNS, 'rect');
      rightGoalBox.setAttribute('x', '96.5');
      rightGoalBox.setAttribute('y', '24.85');
      rightGoalBox.setAttribute('width', '5.5');
      rightGoalBox.setAttribute('height', '18.3');
      pitchLinesGroup.appendChild(rightGoalBox);

      // Right Penalty spot & Arc
      const rightPenSpot = document.createElementNS(svgNS, 'circle');
      rightPenSpot.setAttribute('cx', '91');
      rightPenSpot.setAttribute('cy', '34');
      rightPenSpot.setAttribute('r', '0.6');
      rightPenSpot.setAttribute('fill', 'rgba(236, 227, 209, 0.7)');
      pitchLinesGroup.appendChild(rightPenSpot);

      const rightArc = document.createElementNS(svgNS, 'path');
      rightArc.setAttribute('d', 'M 85.5 27.5 A 9.15 9.15 0 0 0 85.5 40.5');
      pitchLinesGroup.appendChild(rightArc);

      // Goal Nets
      const leftGoal = document.createElementNS(svgNS, 'rect');
      leftGoal.setAttribute('x', '1.2');
      leftGoal.setAttribute('y', '30.34');
      leftGoal.setAttribute('width', '1.8');
      leftGoal.setAttribute('height', '7.32');
      leftGoal.setAttribute('stroke-dasharray', '0.8 0.8');
      pitchLinesGroup.appendChild(leftGoal);

      const rightGoal = document.createElementNS(svgNS, 'rect');
      rightGoal.setAttribute('x', '102');
      rightGoal.setAttribute('y', '30.34');
      rightGoal.setAttribute('width', '1.8');
      rightGoal.setAttribute('height', '7.32');
      rightGoal.setAttribute('stroke-dasharray', '0.8 0.8');
      pitchLinesGroup.appendChild(rightGoal);

      svg.appendChild(pitchLinesGroup);
    }

    drawPitchBase();

    // Data Layer Container Group
    const dynamicLayersGroup = document.createElementNS(svgNS, 'g');
    dynamicLayersGroup.setAttribute('id', 'pitchDynamicLayers');
    svg.appendChild(dynamicLayersGroup);

    container.appendChild(svg);

    // Tooltip Helpers
    function showTooltip(evt, title, text) {
      const rect = container.getBoundingClientRect();
      const clientX = evt.clientX || (evt.touches && evt.touches[0].clientX);
      const clientY = evt.clientY || (evt.touches && evt.touches[0].clientY);
      
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      tooltip.innerHTML = `<div class="tooltip-title">${title}</div><div>${text}</div>`;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.classList.add('is-active');
    }

    function hideTooltip() {
      tooltip.classList.remove('is-active');
    }

    // Render Active Data Layers
    function renderLayers() {
      while (dynamicLayersGroup.firstChild) {
        dynamicLayersGroup.removeChild(dynamicLayersGroup.firstChild);
      }

      // Filter function
      const filterItem = (item) => {
        if (activeTeamFilter !== 'all' && item.team !== activeTeamFilter) return false;
        if (activeHalfFilter !== 'all' && item.half && item.half.toString() !== activeHalfFilter) return false;
        return true;
      };

      // 1. Heatmap Layer
      if (activeLayers.heatmap && matchData.heatmapZones) {
        const heatmapGroup = document.createElementNS(svgNS, 'g');
        heatmapGroup.setAttribute('opacity', '0.65');

        matchData.heatmapZones.filter(filterItem).forEach((zone) => {
          const zoneRect = document.createElementNS(svgNS, 'rect');
          zoneRect.setAttribute('x', zone.x.toString());
          zoneRect.setAttribute('y', zone.y.toString());
          zoneRect.setAttribute('width', zone.width.toString());
          zoneRect.setAttribute('height', zone.height.toString());
          zoneRect.setAttribute('rx', '3');
          
          const fill = zone.team === 'home' ? 'rgba(47, 111, 237, ' + zone.intensity + ')' : 'rgba(230, 57, 70, ' + zone.intensity + ')';
          zoneRect.setAttribute('fill', fill);
          heatmapGroup.appendChild(zoneRect);
        });
        dynamicLayersGroup.appendChild(heatmapGroup);
      }

      // 2. Passing Network Layer
      if (activeLayers.passes && matchData.passingNetwork) {
        const passGroup = document.createElementNS(svgNS, 'g');

        // Draw connections
        matchData.passingNetwork.connections.filter(filterItem).forEach((conn) => {
          const line = document.createElementNS(svgNS, 'line');
          line.setAttribute('x1', conn.x1.toString());
          line.setAttribute('y1', conn.y1.toString());
          line.setAttribute('x2', conn.x2.toString());
          line.setAttribute('y2', conn.y2.toString());
          line.setAttribute('stroke', conn.team === 'home' ? '#6898F6' : '#F28B82');
          line.setAttribute('stroke-width', (0.4 + conn.volume * 0.15).toString());
          line.setAttribute('stroke-opacity', '0.65');
          line.setAttribute('class', 'pass-connection-line');

          line.addEventListener('mouseenter', (e) => {
            showTooltip(e, `${conn.from} ➔ ${conn.to}`, `Completed Passes: ${conn.volume} · Success Rate: ${conn.successRate}%`);
          });
          line.addEventListener('mouseleave', hideTooltip);

          passGroup.appendChild(line);
        });

        // Draw player node circles
        matchData.passingNetwork.nodes.filter(filterItem).forEach((node) => {
          const nodeG = document.createElementNS(svgNS, 'g');
          nodeG.setAttribute('class', 'pitch-player-node');

          const circle = document.createElementNS(svgNS, 'circle');
          circle.setAttribute('cx', node.x.toString());
          circle.setAttribute('cy', node.y.toString());
          circle.setAttribute('r', (1.4 + node.involvement * 0.05).toString());
          circle.setAttribute('fill', node.team === 'home' ? '#1B4DAB' : '#B81D24');
          circle.setAttribute('stroke', '#ECE3D1');
          circle.setAttribute('stroke-width', '0.4');

          const label = document.createElementNS(svgNS, 'text');
          label.setAttribute('x', node.x.toString());
          label.setAttribute('y', (node.y + 0.5).toString());
          label.setAttribute('font-size', '1.6');
          label.setAttribute('font-weight', 'bold');
          label.setAttribute('fill', '#ECE3D1');
          label.setAttribute('text-anchor', 'middle');
          label.textContent = node.number.toString();

          nodeG.appendChild(circle);
          nodeG.appendChild(label);

          nodeG.addEventListener('mouseenter', (e) => {
            showTooltip(e, `#${node.number} ${node.name}`, `Position: ${node.pos} · Passes: ${node.passes} · Accuracy: ${node.acc}%`);
          });
          nodeG.addEventListener('mouseleave', hideTooltip);

          passGroup.appendChild(nodeG);
        });

        dynamicLayersGroup.appendChild(passGroup);
      }

      // 3. Average Positions Layer
      if (activeLayers.positions && matchData.averagePositions) {
        const posGroup = document.createElementNS(svgNS, 'g');
        matchData.averagePositions.filter(filterItem).forEach((pos) => {
          const circle = document.createElementNS(svgNS, 'circle');
          circle.setAttribute('cx', pos.x.toString());
          circle.setAttribute('cy', pos.y.toString());
          circle.setAttribute('r', '1.6');
          circle.setAttribute('fill', pos.team === 'home' ? '#2F6FED' : '#E63946');
          circle.setAttribute('stroke', '#ECE3D1');
          circle.setAttribute('stroke-width', '0.5');

          const label = document.createElementNS(svgNS, 'text');
          label.setAttribute('x', pos.x.toString());
          label.setAttribute('y', (pos.y - 2.5).toString());
          label.setAttribute('font-size', '1.8');
          label.setAttribute('fill', '#ECE3D1');
          label.setAttribute('text-anchor', 'middle');
          label.textContent = pos.name;

          posGroup.appendChild(circle);
          posGroup.appendChild(label);
        });
        dynamicLayersGroup.appendChild(posGroup);
      }

      // 4. Defensive Recoveries & Pressing Layer
      if (activeLayers.recoveries && matchData.defensiveEvents) {
        const defGroup = document.createElementNS(svgNS, 'g');
        matchData.defensiveEvents.filter(filterItem).forEach((ev) => {
          const diamond = document.createElementNS(svgNS, 'polygon');
          const d = 1.2;
          diamond.setAttribute('points', `${ev.x},${ev.y - d} ${ev.x + d},${ev.y} ${ev.x},${ev.y + d} ${ev.x - d},${ev.y}`);
          diamond.setAttribute('fill', ev.type === 'recovery' ? '#52B788' : '#DDA15E');
          diamond.setAttribute('stroke', '#142E20');
          diamond.setAttribute('stroke-width', '0.3');

          diamond.addEventListener('mouseenter', (e) => {
            showTooltip(e, `${ev.player} (${ev.type.toUpperCase()})`, `Minute: ${ev.minute}' · Outcome: Success`);
          });
          diamond.addEventListener('mouseleave', hideTooltip);

          defGroup.appendChild(diamond);
        });
        dynamicLayersGroup.appendChild(defGroup);
      }

      // 5. Shots and Goals Layer
      if (activeLayers.shots && matchData.shots) {
        const shotsGroup = document.createElementNS(svgNS, 'g');

        matchData.shots.filter(filterItem).forEach((shot) => {
          const shotMarker = document.createElementNS(svgNS, 'circle');
          shotMarker.setAttribute('cx', shot.x.toString());
          shotMarker.setAttribute('cy', shot.y.toString());
          
          // Radius scales with xG (0.02 -> 1.0)
          const radius = Math.max(1.0, Math.sqrt(shot.xg) * 4.2);
          shotMarker.setAttribute('r', radius.toString());
          shotMarker.setAttribute('class', 'pitch-shot-marker');

          if (shot.outcome === 'goal') {
            shotMarker.setAttribute('fill', '#F4A261');
            shotMarker.setAttribute('stroke', '#FFFFFF');
            shotMarker.setAttribute('stroke-width', '0.7');
          } else if (shot.outcome === 'saved') {
            shotMarker.setAttribute('fill', shot.team === 'home' ? '#2F6FED' : '#E63946');
            shotMarker.setAttribute('stroke', '#ECE3D1');
            shotMarker.setAttribute('stroke-width', '0.4');
            shotMarker.setAttribute('opacity', '0.85');
          } else {
            // Blocked or missed
            shotMarker.setAttribute('fill', 'none');
            shotMarker.setAttribute('stroke', shot.team === 'home' ? '#2F6FED' : '#E63946');
            shotMarker.setAttribute('stroke-width', '0.45');
            shotMarker.setAttribute('stroke-dasharray', '0.5 0.5');
          }

          // Trajectory arrow towards goal
          if (shot.targetX && shot.targetY) {
            const arrow = document.createElementNS(svgNS, 'line');
            arrow.setAttribute('x1', shot.x.toString());
            arrow.setAttribute('y1', shot.y.toString());
            arrow.setAttribute('x2', shot.targetX.toString());
            arrow.setAttribute('y2', shot.targetY.toString());
            arrow.setAttribute('stroke', shot.outcome === 'goal' ? '#F4A261' : 'rgba(236, 227, 209, 0.4)');
            arrow.setAttribute('stroke-width', shot.outcome === 'goal' ? '0.5' : '0.25');
            shotsGroup.appendChild(arrow);
          }

          shotMarker.addEventListener('mouseenter', (e) => {
            const outcomeLabel = shot.outcome === 'goal' ? '⚽ GOAL' : shot.outcome.toUpperCase();
            showTooltip(e, `${shot.player} (${outcomeLabel})`, `Min ${shot.minute}' · xG: ${shot.xg.toFixed(2)} · Situation: ${shot.situation || 'Open Play'}`);
          });
          shotMarker.addEventListener('mouseleave', hideTooltip);

          shotsGroup.appendChild(shotMarker);
        });

        dynamicLayersGroup.appendChild(shotsGroup);
      }
    }

    renderLayers();

    // Hook up toolbar buttons
    const toolbar = container.parentElement.querySelector('.pitch-control-toolbar');
    if (toolbar) {
      // Layer buttons
      toolbar.querySelectorAll('[data-layer]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const layer = btn.getAttribute('data-layer');
          activeLayers[layer] = !activeLayers[layer];
          btn.classList.toggle('is-active', activeLayers[layer]);
          renderLayers();
        });
      });

      // Team filter buttons
      toolbar.querySelectorAll('[data-team-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          toolbar.querySelectorAll('[data-team-filter]').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          activeTeamFilter = btn.getAttribute('data-team-filter');
          renderLayers();
        });
      });

      // Half filter buttons
      toolbar.querySelectorAll('[data-half-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          toolbar.querySelectorAll('[data-half-filter]').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          activeHalfFilter = btn.getAttribute('data-half-filter');
          renderLayers();
        });
      });
    }
  }

  /* ==========================================================================
     2. ROLLING xG & MOMENTUM TIMELINE CHART
     ========================================================================== */
  function initRollingXGChart(containerId, chartData) {
    const container = document.getElementById(containerId);
    if (!container || !chartData) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const width = 1000;
    const height = 240;
    const margin = { top: 30, right: 40, bottom: 40, left: 60 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'momentum-chart-svg');

    // Max xG scale
    const maxXG = chartData.maxXG || 2.5;

    // Time to X coordinate (0 to 90 mins)
    const scaleX = (min) => margin.left + (min / 90) * chartW;
    // xG to Y coordinate (0 to maxXG)
    const scaleY = (xg) => margin.top + chartH - (xg / maxXG) * chartH;

    // Grid lines
    const gridG = document.createElementNS(svgNS, 'g');
    gridG.setAttribute('stroke', 'rgba(67, 40, 42, 0.12)');
    gridG.setAttribute('stroke-width', '1');

    // Horizontal lines at 0.5, 1.0, 1.5, 2.0
    for (let xg = 0.5; xg <= maxXG; xg += 0.5) {
      const y = scaleY(xg);
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', margin.left.toString());
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', (margin.left + chartW).toString());
      line.setAttribute('y2', y.toString());
      gridG.appendChild(line);

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', (margin.left - 10).toString());
      label.setAttribute('y', (y + 4).toString());
      label.setAttribute('font-size', '10');
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', 'rgba(67, 40, 42, 0.6)');
      label.textContent = xg.toFixed(1);
      gridG.appendChild(label);
    }

    // Vertical line at 45' (Half-time)
    const htLine = document.createElementNS(svgNS, 'line');
    htLine.setAttribute('x1', scaleX(45).toString());
    htLine.setAttribute('y1', margin.top.toString());
    htLine.setAttribute('x2', scaleX(45).toString());
    htLine.setAttribute('y2', (margin.top + chartH).toString());
    htLine.setAttribute('stroke-dasharray', '4 4');
    gridG.appendChild(htLine);

    const htLabel = document.createElementNS(svgNS, 'text');
    htLabel.setAttribute('x', scaleX(45).toString());
    htLabel.setAttribute('y', (margin.top - 10).toString());
    htLabel.setAttribute('font-size', '10');
    htLabel.setAttribute('text-anchor', 'middle');
    htLabel.setAttribute('fill', 'var(--rust)');
    htLabel.textContent = 'HALF TIME';
    gridG.appendChild(htLabel);

    svg.appendChild(gridG);

    // Build Step Paths for cumulative xG
    function buildStepPath(points) {
      let d = `M ${scaleX(0)} ${scaleY(0)}`;
      points.forEach((pt) => {
        d += ` H ${scaleX(pt.minute)} V ${scaleY(pt.xg)}`;
      });
      d += ` H ${scaleX(90)}`;
      return d;
    }

    // Home Team Path (Dark Ink)
    if (chartData.home) {
      const homePath = document.createElementNS(svgNS, 'path');
      homePath.setAttribute('d', buildStepPath(chartData.home));
      homePath.setAttribute('fill', 'none');
      homePath.setAttribute('stroke', '#43282A');
      homePath.setAttribute('stroke-width', '2.5');
      svg.appendChild(homePath);
    }

    // Away Team Path (Rust)
    if (chartData.away) {
      const awayPath = document.createElementNS(svgNS, 'path');
      awayPath.setAttribute('d', buildStepPath(chartData.away));
      awayPath.setAttribute('fill', 'none');
      awayPath.setAttribute('stroke', '#A86438');
      awayPath.setAttribute('stroke-width', '2.5');
      svg.appendChild(awayPath);
    }

    // Goals Icons on Chart
    if (chartData.goals) {
      chartData.goals.forEach((g) => {
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', scaleX(g.minute).toString());
        circle.setAttribute('cy', scaleY(g.xg).toString());
        circle.setAttribute('r', '6');
        circle.setAttribute('fill', g.team === 'home' ? '#43282A' : '#A86438');
        circle.setAttribute('stroke', '#ECE3D1');
        circle.setAttribute('stroke-width', '1.5');

        const title = document.createElementNS(svgNS, 'title');
        title.textContent = `⚽ ${g.player} (${g.minute}') - Total xG: ${g.xg.toFixed(2)}`;
        circle.appendChild(title);

        svg.appendChild(circle);
      });
    }

    container.appendChild(svg);
  }

  /* ==========================================================================
     3. RADAR SPIDER CHART ENGINE (Multi-axis Player Comparison)
     ========================================================================== */
  function initRadarChart(containerId, radarData) {
    const container = document.getElementById(containerId);
    if (!container || !radarData) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const size = 380;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 135;

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('class', 'radar-chart-svg');

    const metrics = radarData.metrics; // Array of strings (e.g. 6 metrics)
    const numAxes = metrics.length;
    const angleStep = (Math.PI * 2) / numAxes;

    // Draw concentric polygon grid
    const levels = [0.25, 0.5, 0.75, 1.0];
    levels.forEach((lvl) => {
      let polyPoints = '';
      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + radius * lvl * Math.cos(angle);
        const y = cy + radius * lvl * Math.sin(angle);
        polyPoints += `${x},${y} `;
      }
      const poly = document.createElementNS(svgNS, 'polygon');
      poly.setAttribute('points', polyPoints.trim());
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', 'rgba(67, 40, 42, 0.14)');
      poly.setAttribute('stroke-width', '1');
      svg.appendChild(poly);
    });

    // Draw axes lines & labels
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x2 = cx + radius * Math.cos(angle);
      const y2 = cy + radius * Math.sin(angle);

      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', cx.toString());
      line.setAttribute('y1', cy.toString());
      line.setAttribute('x2', x2.toString());
      line.setAttribute('y2', y2.toString());
      line.setAttribute('stroke', 'rgba(67, 40, 42, 0.16)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      // Label
      const labelX = cx + (radius + 22) * Math.cos(angle);
      const labelY = cy + (radius + 22) * Math.sin(angle);
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', labelX.toString());
      text.setAttribute('y', (labelY + 4).toString());
      text.setAttribute('font-size', '9.5');
      text.setAttribute('font-weight', '600');
      text.setAttribute('letter-spacing', '0.06em');
      text.setAttribute('fill', 'var(--ink)');
      text.setAttribute('text-anchor', Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end');
      text.textContent = metrics[i];
      svg.appendChild(text);
    }

    // Draw Data Polygons
    radarData.players.forEach((player) => {
      let playerPoints = '';
      for (let i = 0; i < numAxes; i++) {
        const val = player.values[i]; // 0 to 100 percentile
        const norm = val / 100;
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + radius * norm * Math.cos(angle);
        const y = cy + radius * norm * Math.sin(angle);
        playerPoints += `${x},${y} `;
      }

      const poly = document.createElementNS(svgNS, 'polygon');
      poly.setAttribute('points', playerPoints.trim());
      poly.setAttribute('fill', player.color);
      poly.setAttribute('fill-opacity', '0.35');
      poly.setAttribute('stroke', player.color);
      poly.setAttribute('stroke-width', '2');
      svg.appendChild(poly);
    });

    container.appendChild(svg);
  }

  /* ==========================================================================
     4. ISL MATCH OUTCOME PREDICTION SIMULATOR
     ========================================================================== */
  function initISLSimulator(homeSelectId, awaySelectId, resultContainerId) {
    const homeSel = document.getElementById(homeSelectId);
    const awaySel = document.getElementById(awaySelectId);
    const resultBox = document.getElementById(resultContainerId);

    if (!homeSel || !awaySel || !resultBox) return;

    // Team features based on Indian Super League metrics
    const islTeamStats = {
      'mohun-bagan': { name: 'Mohun Bagan Super Giant', elo: 1680, xgFor: 1.88, xgAgainst: 0.92, possession: 57 },
      'mumbai-city': { name: 'Mumbai City FC', elo: 1665, xgFor: 1.82, xgAgainst: 0.98, possession: 58 },
      'fc-goa': { name: 'FC Goa', elo: 1610, xgFor: 1.65, xgAgainst: 1.05, possession: 55 },
      'kerala-blasters': { name: 'Kerala Blasters FC', elo: 1545, xgFor: 1.48, xgAgainst: 1.35, possession: 51 },
      'bengaluru-fc': { name: 'Bengaluru FC', elo: 1530, xgFor: 1.42, xgAgainst: 1.38, possession: 49 },
      'chennaiyin-fc': { name: 'Chennaiyin FC', elo: 1475, xgFor: 1.32, xgAgainst: 1.55, possession: 46 }
    };

    function recalculate() {
      const hKey = homeSel.value;
      const aKey = awaySel.value;

      if (hKey === aKey) {
        resultBox.innerHTML = '<p class="error-msg">Please select two distinct clubs.</p>';
        return;
      }

      const h = islTeamStats[hKey];
      const a = islTeamStats[aKey];

      // Feature difference + Home advantage bonus (+65 Elo points)
      const eloDiff = (h.elo + 65) - a.elo;
      const xgDiff = h.xgFor - a.xgAgainst - (a.xgFor - h.xgAgainst);

      // Model logistic regression weights:
      // P(Home) = 1 / (1 + 10^(-eloDiff / 400))
      const expHome = 1 / (1 + Math.pow(10, -eloDiff / 420));
      // Draw probability estimation
      const drawProb = 0.28 * Math.exp(-Math.pow(eloDiff / 250, 2));
      const remain = 1 - drawProb;
      const homeWinProb = Math.min(Math.max(expHome * remain, 0.08), 0.85);
      const awayWinProb = 1 - homeWinProb - drawProb;

      const hw = Math.round(homeWinProb * 100);
      const dw = Math.round(drawProb * 100);
      const aw = Math.round(awayWinProb * 100);

      resultBox.innerHTML = `
        <div class="sim-probability-display">
          <div class="prob-card prob-home">
            <span class="prob-num">${hw}%</span>
            <span class="prob-team">${h.name} Win</span>
          </div>
          <div class="prob-card prob-draw">
            <span class="prob-num">${dw}%</span>
            <span class="prob-team">Draw</span>
          </div>
          <div class="prob-card prob-away">
            <span class="prob-num">${aw}%</span>
            <span class="prob-team">${a.name} Win</span>
          </div>
        </div>
        <div class="sim-bars">
          <div class="sim-bar-home" style="width: ${hw}%;"></div>
          <div class="sim-bar-draw" style="width: ${dw}%;"></div>
          <div class="sim-bar-away" style="width: ${aw}%;"></div>
        </div>
        <p class="sim-metrics-note">
          Model factors: Squad Elo rating, rolling expected goal difference (ΔxG: ${xgDiff > 0 ? '+' : ''}${xgDiff.toFixed(2)}), and empirical home-field tilt.
        </p>
      `;
    }

    homeSel.addEventListener('change', recalculate);
    awaySel.addEventListener('change', recalculate);
    recalculate();
  }

})();
