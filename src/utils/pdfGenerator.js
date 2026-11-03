import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * EcoTrack Sustainability Progress Report Generator
 * Generates an executive, publication-grade PDF report based on verified user data.
 *
 * @param {Object} user - The authenticated user profile
 * @param {Object} userData - User tracking data from UserContext
 * @param {string} period - 'weekly' | 'monthly' | 'all-time'
 * @returns {Promise<boolean>}
 */
export async function generateSustainabilityReport(user, userData, period = 'weekly') {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Theme Palette: Eco Green & Clean Neutrals
    const PRIMARY_COLOR = [27, 67, 50];     // #1b4332 - Deep Forest Green
    const SECONDARY_COLOR = [45, 106, 79];  // #2d6a4f - Eco Leaf Green
    const ACCENT_COLOR = [116, 198, 157];   // #74c69d - Mint Green
    const TEXT_DARK = [33, 37, 41];         // #212529 - Charcoal Dark
    const TEXT_MUTED = [108, 117, 125];     // #6c757d - Slate Gray
    const BG_LIGHT = [248, 250, 248];       // Light Eco Tint

    const now = Date.now();
    const oneDayMs = 86400000;

    // Determine timeframe boundaries
    let daysInPeriod = 7;
    let periodLabel = 'Weekly Report (Last 7 Days)';
    let fileSuffix = 'Weekly';
    let currentPeriodStart = now - 7 * oneDayMs;
    let prevPeriodStart = currentPeriodStart - 7 * oneDayMs;

    if (period === 'monthly') {
      daysInPeriod = 30;
      periodLabel = 'Monthly Report (Last 30 Days)';
      fileSuffix = 'Monthly';
      currentPeriodStart = now - 30 * oneDayMs;
      prevPeriodStart = currentPeriodStart - 30 * oneDayMs;
    } else if (period === 'all-time') {
      const joinTime = user?.joinDate ? new Date(user.joinDate).getTime() : now - 30 * oneDayMs;
      daysInPeriod = Math.max(1, Math.ceil((now - joinTime) / oneDayMs));
      periodLabel = 'All-Time Comprehensive Report';
      fileSuffix = 'AllTime';
      currentPeriodStart = 0; // all historical
      prevPeriodStart = 0;
    }

    const periodDateRange = period === 'all-time'
      ? 'All Available Records to Date'
      : `${new Date(currentPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${new Date(now).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const generationDateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // -------------------------------------------------------------
    // Metric Computations (Matching Analytics Page Logic)
    // -------------------------------------------------------------
    const totalFootprint = userData?.totalFootprint ?? 0;
    const sustainabilityScore = userData?.sustainabilityScore ?? 0;
    const ecoStreak = userData?.ecoStreak ?? 0;
    const rewardPoints = userData?.rewardPoints ?? 0;
    const calculationHistory = userData?.calculationHistory || [];
    const habits = userData?.habits || [];
    const weeklyProgress = userData?.weeklyProgress || {};
    const challenges = userData?.challenges || [];
    const recommendations = userData?.recommendations || [];
    const badges = userData?.badges || [];
    const redeemedRewards = userData?.redeemedRewards || [];
    const impactBreakdown = userData?.impactBreakdown || [];

    // Filter calculations for active period
    const currentCalcs = calculationHistory.filter(item => {
      const t = item.id && typeof item.id === 'number' ? item.id : new Date(item.date).getTime();
      return t >= currentPeriodStart && t <= now;
    });

    const prevCalcs = period === 'all-time' ? [] : calculationHistory.filter(item => {
      const t = item.id && typeof item.id === 'number' ? item.id : new Date(item.date).getTime();
      return t >= prevPeriodStart && t < currentPeriodStart;
    });

    let currentEmissions = currentCalcs.reduce((sum, c) => sum + (parseFloat(c.total) || 0), 0);
    const prevEmissions = prevCalcs.reduce((sum, c) => sum + (parseFloat(c.total) || 0), 0);

    // Fallbacks if history is empty
    if (currentEmissions === 0 && calculationHistory.length === 0) {
      if (period === 'all-time') {
        currentEmissions = totalFootprint;
      } else {
        const chartData = userData?.chartData || [];
        currentEmissions = chartData.reduce((sum, c) => sum + (parseFloat(c.emissions) || 0), 0);
      }
    }

    const dailyAvgEmissions = (currentEmissions / daysInPeriod).toFixed(2);

    let comparisonText = 'No prior period data';
    if (period !== 'all-time' && prevEmissions > 0) {
      const pct = (((currentEmissions - prevEmissions) / prevEmissions) * 100).toFixed(1);
      comparisonText = pct < 0 ? `${Math.abs(pct)}% reduction vs previous period` : `+${pct}% increase vs previous period`;
    } else if (period !== 'all-time' && currentEmissions > 0 && prevEmissions === 0) {
      comparisonText = 'Initial baseline period established';
    } else if (period === 'all-time') {
      comparisonText = 'Full cumulative history recorded';
    }

    // Category breakdown
    const categoryTotals = {
      Transportation: 0,
      Electricity: 0,
      Food: 0,
      Water: 0,
      Waste: 0,
    };
    let catCount = 0;
    currentCalcs.forEach(c => {
      if (Array.isArray(c.breakdown)) {
        c.breakdown.forEach(b => {
          const name = b.name === 'Transport' ? 'Transportation' : b.name;
          if (categoryTotals[name] !== undefined) {
            categoryTotals[name] += parseFloat(b.value) || 0;
            catCount++;
          }
        });
      }
    });

    // Fallback to impactBreakdown if no calculation entries
    if (catCount === 0 && impactBreakdown.length > 0) {
      impactBreakdown.forEach(item => {
        if (categoryTotals[item.name] !== undefined) {
          categoryTotals[item.name] = parseFloat(item.value) || 0;
        }
      });
    }

    // Habits metrics
    const completedHabits = habits.filter(h => h.completed).length;
    const pendingHabits = habits.filter(h => !h.completed).length;
    const habitCompletionRate = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;

    // Habit consistency from actual weeklyProgress
    const daysToCheck = period === 'all-time' ? Object.keys(weeklyProgress).length || 7 : daysInPeriod;
    let loggedDays = 0;
    let sumConsistency = 0;
    const recordedDaysList = [];

    for (let i = daysToCheck - 1; i >= 0; i--) {
      const d = new Date(now - i * oneDayMs);
      const dateKey = d.toISOString().slice(0, 10);
      if (Object.prototype.hasOwnProperty.call(weeklyProgress, dateKey)) {
        loggedDays++;
        const p = weeklyProgress[dateKey];
        sumConsistency += p;
        recordedDaysList.push({ date: dateKey, rate: `${p}%` });
      }
    }
    const avgConsistency = loggedDays > 0 ? Math.round(sumConsistency / loggedDays) : 0;

    // Challenge metrics
    const joinedChallenges = challenges.filter(c => c.status === 'active' || c.status === 'completed');
    const completedChallenges = challenges.filter(c => c.status === 'completed');
    const activeChallenges = challenges.filter(c => c.status === 'active');
    const challengeCompletionPct = joinedChallenges.length > 0
      ? Math.round((completedChallenges.length / joinedChallenges.length) * 100)
      : 0;

    // -------------------------------------------------------------
    // PDF Rendering
    // -------------------------------------------------------------
    let yPos = 20;

    // Helper: Section title bar
    const renderSectionHeader = (title, subtitle = '') => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 25;
      }
      doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.rect(14, yPos, 4, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.text(title, 21, yPos + 6);

      if (subtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
        doc.text(subtitle, 21, yPos + 11);
        yPos += 16;
      } else {
        yPos += 12;
      }
    };

    // =============================================================
    // SECTION A: Cover & Header Banner
    // =============================================================
    // Top Eco Forest Accent Banner
    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(0, 0, 210, 36, 'F');

    // Header Logo & Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('EcoTrack', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
    doc.text('Personal Sustainability & Carbon Intelligence Platform', 14, 25);

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(periodLabel.toUpperCase(), 196, 20, { align: 'right' });
    doc.setFontSize(8);
    doc.setTextColor(220, 240, 230);
    doc.text(`Generated: ${generationDateStr}`, 196, 26, { align: 'right' });

    yPos = 46;

    // Report Title & User Meta Box
    doc.setFillColor(BG_LIGHT[0], BG_LIGHT[1], BG_LIGHT[2]);
    doc.setDrawColor(220, 225, 220);
    doc.roundedRect(14, yPos, 182, 28, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.text('Sustainability Progress Report', 20, yPos + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(`Report Subject: ${user?.name || 'EcoTrack User'}`, 20, yPos + 15);
    doc.text(`Account Reference: ${user?.email || 'N/A'}`, 20, yPos + 21);

    doc.text(`Reporting Window: ${periodDateRange}`, 110, yPos + 15);
    doc.text(`Environmental Goal: ${user?.sustainabilityGoal || 'Carbon Footprint Reduction'}`, 110, yPos + 21);

    yPos += 36;

    // =============================================================
    // SECTION B: Sustainability Overview (Summary Metrics Table)
    // =============================================================
    renderSectionHeader('1. Executive Sustainability Overview', 'Core environmental milestones and verified tracking indicators.');

    autoTable(doc, {
      startY: yPos,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      head: [['Metric Indicator', 'Measured Value', 'Unit / Benchmark', 'Performance Assessment']],
      body: [
        ['Cumulative Carbon Footprint', `${totalFootprint}`, 'kg CO₂e', totalFootprint === 0 ? 'Tracking initiated' : 'All-time cumulative total'],
        [`${periodLabel} Emissions`, `${currentEmissions.toFixed(2)}`, 'kg CO₂e', comparisonText],
        ['Daily Average Emissions', `${dailyAvgEmissions}`, 'kg CO₂e / day', 'Calculated across active period'],
        ['Sustainability Score', `${sustainabilityScore} / 100`, 'Index Score', sustainabilityScore >= 70 ? 'Excellent sustainable pace' : 'Active improvement potential'],
        ['Eco-Streak', `${ecoStreak}`, 'Consecutive Days', ecoStreak > 0 ? 'Consistent habit engagement' : 'Streak resets upon inactivity'],
        ['Total Eco-Points Balance', `${rewardPoints.toLocaleString()}`, 'Reward Points', 'Earned from green milestones & habits'],
      ],
      headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: TEXT_DARK },
      alternateRowStyles: { fillColor: BG_LIGHT },
    });

    yPos = doc.lastAutoTable.finalY + 12;

    // =============================================================
    // SECTION C: Carbon Footprint Analysis
    // =============================================================
    renderSectionHeader('2. Carbon Footprint Analysis', 'Source-level emission categorization and verified activity records.');

    const totalCatEmissions = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const catRows = Object.keys(categoryTotals).map(cat => {
      const val = categoryTotals[cat];
      const pct = totalCatEmissions > 0 ? ((val / totalCatEmissions) * 100).toFixed(1) : '0.0';
      return [cat, `${val.toFixed(2)} kg CO₂e`, `${pct}%`];
    });

    autoTable(doc, {
      startY: yPos,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['Emission Source / Category', 'Recorded Carbon Output', 'Share of Total Footprint']],
      body: catRows.length > 0 ? catRows : [['No data recorded', '0.00 kg CO₂e', '0.0%']],
      headStyles: { fillColor: SECONDARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5, textColor: TEXT_DARK },
    });

    yPos = doc.lastAutoTable.finalY + 8;

    // Detailed recent calculation entries in period
    if (currentCalcs.length > 0) {
      const recentCalcRows = currentCalcs.slice(0, 5).map(c => [
        c.date || new Date(c.id).toLocaleDateString(),
        c.transportType ? c.transportType.toUpperCase() : 'Standard',
        `${c.total} kg CO₂e`,
        Array.isArray(c.breakdown) ? c.breakdown.map(b => `${b.name}: ${b.value}kg`).join(', ') : 'Aggregated',
      ]);

      autoTable(doc, {
        startY: yPos,
        margin: { left: 14, right: 14 },
        theme: 'plain',
        head: [['Calculation Timestamp', 'Transport Mode', 'Emissions Output', 'Category Breakdown']],
        body: recentCalcRows,
        headStyles: { fillColor: [230, 235, 230], textColor: PRIMARY_COLOR, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
      });
      yPos = doc.lastAutoTable.finalY + 12;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text('No individual carbon calculation records logged during this timeframe.', 14, yPos);
      yPos += 8;
    }

    // =============================================================
    // SECTION D: Habit Performance & Consistency
    // =============================================================
    renderSectionHeader('3. Habit Performance & Consistency', 'Daily habit tracking, completion ratios, and verified streak integrity.');

    autoTable(doc, {
      startY: yPos,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      head: [['Total Habits Monitored', 'Completed Today', 'Pending Today', 'Daily Completion Rate', 'Period Consistency']],
      body: [
        [`${habits.length}`, `${completedHabits}`, `${pendingHabits}`, `${habitCompletionRate}%`, `${avgConsistency}% (${loggedDays}/${daysToCheck} logged)`]
      ],
      headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5, textColor: TEXT_DARK },
    });

    yPos = doc.lastAutoTable.finalY + 8;

    // Individual habit inventory
    const habitRows = habits.map(h => [
      h.text,
      h.category ? h.category.toUpperCase() : 'GENERAL',
      `+${h.points || 5} pts`,
      `${h.streak || 0} days`,
      h.completed ? 'COMPLETED' : 'PENDING'
    ]);

    autoTable(doc, {
      startY: yPos,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['Habit Description', 'Category', 'Points Reward', 'Current Streak', 'Status']],
      body: habitRows.length > 0 ? habitRows : [['No habits currently configured', '-', '-', '-', '-']],
      headStyles: { fillColor: SECONDARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
      alternateRowStyles: { fillColor: BG_LIGHT },
    });

    yPos = doc.lastAutoTable.finalY + 8;

    // Explicit Historical Data Limitation Note
    doc.setFillColor(254, 252, 232); // light amber
    doc.setDrawColor(254, 240, 138);
    doc.roundedRect(14, yPos, 182, 10, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(161, 98, 7);
    doc.text('Data Limitation Notice:', 18, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.text('Historical habit records reflect only dates where habits were checked in weeklyProgress. Days without records show 0% rather than estimates.', 50, yPos + 6);

    yPos += 18;

    // =============================================================
    // SECTION E: Eco-Challenges
    // =============================================================
    renderSectionHeader('4. Community Eco-Challenges', 'Commitment progress across verified sustainability challenges.');

    const challengeRows = challenges.map(c => [
      c.title,
      c.duration || 'Flexible',
      c.difficulty || 'Medium',
      `+${c.points || 100} pts`,
      `${c.progress || 0}%`,
      (c.status || 'available').toUpperCase()
    ]);

    autoTable(doc, {
      startY: yPos,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['Challenge Title', 'Duration', 'Difficulty', 'Reward', 'Progress', 'Status']],
      body: challengeRows.length > 0 ? challengeRows : [['No challenges found', '-', '-', '-', '-', '-']],
      headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
      alternateRowStyles: { fillColor: BG_LIGHT },
    });

    yPos = doc.lastAutoTable.finalY + 12;

    // =============================================================
    // SECTION F: Rewards, Badges & Redemptions
    // =============================================================
    renderSectionHeader('5. Rewards & Gamification Achievements', 'Earned recognition, unlocked badges, and environmental actions redeemed.');

    const unlockedBadges = badges.filter(b => b.unlocked);
    const badgeRows = unlockedBadges.map(b => [
      b.name,
      b.desc,
      'UNLOCKED',
      b.unlockedAt ? new Date(b.unlockedAt).toLocaleDateString() : 'Active'
    ]);

    autoTable(doc, {
      startY: yPos,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      head: [['Badge Title', 'Criterion / Milestone', 'Status', 'Unlocked Date']],
      body: badgeRows.length > 0 ? badgeRows : [['No badges unlocked yet', 'Complete eco-challenges and maintain habit streaks to unlock badges', 'LOCKED', '-']],
      headStyles: { fillColor: SECONDARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
    });

    yPos = doc.lastAutoTable.finalY + 8;

    // Redeemed Rewards
    if (redeemedRewards.length > 0) {
      const redRows = redeemedRewards.map(r => [
        r.name,
        `-${r.cost} pts`,
        new Date(r.redeemedAt).toLocaleDateString(),
        'Verified Environmental Partner'
      ]);
      autoTable(doc, {
        startY: yPos,
        margin: { left: 14, right: 14 },
        theme: 'plain',
        head: [['Redeemed Environmental Reward', 'Points Cost', 'Redemption Date', 'Partner Rail']],
        body: redRows,
        headStyles: { fillColor: [230, 235, 230], textColor: PRIMARY_COLOR, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
      });
      yPos = doc.lastAutoTable.finalY + 12;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text('No points redemptions logged yet. Points can be exchanged for tree-planting actions and partner rewards.', 14, yPos);
      yPos += 10;
    }

    // =============================================================
    // SECTION G: Personalized Recommendations
    // =============================================================
    renderSectionHeader('6. Personalized Sustainability Recommendations', 'Targeted actionable steps to accelerate your environmental impact.');

    const recRows = recommendations.slice(0, 5).map(r => [
      r.title,
      r.category || 'General',
      r.benefit || 'Reduces footprint',
      r.savings || 'Calculated',
      r.difficulty || 'Easy'
    ]);

    autoTable(doc, {
      startY: yPos,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['Recommendation', 'Sector', 'Environmental Benefit', 'Estimated Savings', 'Difficulty']],
      body: recRows.length > 0 ? recRows : [['Continue regular logging to unlock personalized insights', 'All', '-', '-', '-']],
      headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
      alternateRowStyles: { fillColor: BG_LIGHT },
    });

    yPos = doc.lastAutoTable.finalY + 12;

    // =============================================================
    // SECTION H: Conclusion & Data-Grounded Summary
    // =============================================================
    renderSectionHeader('7. Executive Conclusion & Recommended Actions');

    const topCategory = Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b, 'Transportation');
    const conclusionPoints = [
      `Overall Emission Footprint: Total tracked footprint stands at ${totalFootprint} kg CO2e, with an average daily carbon output of ${dailyAvgEmissions} kg CO2e during this reporting window.`,
      `Primary Carbon Driver: ${topCategory} accounts for the highest measured contribution. Prioritizing green adjustments in this sector will deliver the greatest immediate carbon reduction.`,
      `Habit Continuity: User logged an active eco-streak of ${ecoStreak} consecutive days and attained a habit consistency rating of ${avgConsistency}%. Maintaining daily morning checklists will reinforce positive momentum.`,
      `Community & Rewards: ${completedChallenges.length} of ${joinedChallenges.length} joined challenges have been fulfilled, contributing to a total reward balance of ${rewardPoints.toLocaleString()} points.`,
    ];

    conclusionPoints.forEach(point => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 25;
      }
      doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.circle(17, yPos - 1.2, 1, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
      const lines = doc.splitTextToSize(point, 172);
      doc.text(lines, 22, yPos);
      yPos += (lines.length * 4.5) + 3;
    });

    // =============================================================
    // Global Header & Footer Pass (All Pages)
    // =============================================================
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Running header on page 2 onwards
      if (i > 1) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
        doc.text('EcoTrack | Sustainability Progress Report', 14, 12);
        doc.text(periodLabel, 196, 12, { align: 'right' });

        doc.setDrawColor(220, 225, 220);
        doc.line(14, 14, 196, 14);
      }

      // Running footer on all pages
      doc.setDrawColor(220, 225, 220);
      doc.line(14, 285, 196, 285);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      doc.text('EcoTrack Environmental Intelligence Platform • Confidential User Report • Generated locally', 14, 290);
      doc.text(`Page ${i} of ${totalPages}`, 196, 290, { align: 'right' });
    }

    // Sanitize user name for filename
    const safeName = (user?.name || 'User').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `EcoTrack_Sustainability_Report_${fileSuffix}_${safeName}.pdf`;

    // Download PDF directly in browser
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to generate sustainability report:', error);
    throw error;
  }
}
