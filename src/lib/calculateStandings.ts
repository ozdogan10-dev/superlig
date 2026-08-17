import { Team, Match } from '@prisma/client';

export interface Standing {
  teamId: string;
  teamName: string;
  logoUrl: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export function calculateStandings(teams: Team[], matches: Match[]): Standing[] {
  const standingsMap = new Map<string, Standing>();

  teams.forEach(team => {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      logoUrl: team.logoUrl,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  matches.forEach(match => {
    if (match.homeScore === null || match.awayScore === null) return; // not played yet

    const homeStanding = standingsMap.get(match.homeTeamId);
    const awayStanding = standingsMap.get(match.awayTeamId);

    if (!homeStanding || !awayStanding) return;

    homeStanding.played += 1;
    awayStanding.played += 1;

    homeStanding.goalsFor += match.homeScore;
    homeStanding.goalsAgainst += match.awayScore;
    homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;

    awayStanding.goalsFor += match.awayScore;
    awayStanding.goalsAgainst += match.homeScore;
    awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

    if (match.homeScore > match.awayScore) {
      homeStanding.won += 1;
      homeStanding.points += 3;
      awayStanding.lost += 1;
    } else if (match.homeScore < match.awayScore) {
      awayStanding.won += 1;
      awayStanding.points += 3;
      homeStanding.lost += 1;
    } else {
      homeStanding.drawn += 1;
      homeStanding.points += 1;
      awayStanding.drawn += 1;
      awayStanding.points += 1;
    }
  });

  const standingsList = Array.from(standingsMap.values());

  // Group by points for tie-breakers
  const pointsGroups = new Map<number, Standing[]>();
  for (const st of standingsList) {
    if (!pointsGroups.has(st.points)) pointsGroups.set(st.points, []);
    pointsGroups.get(st.points)!.push(st);
  }

  const finalStandings: Standing[] = [];
  const sortedPoints = Array.from(pointsGroups.keys()).sort((a, b) => b - a);

  for (const points of sortedPoints) {
    const group = pointsGroups.get(points)!;
    if (group.length === 1) {
      finalStandings.push(group[0]);
      continue;
    }

    // Tie breaker for group
    // Find all matches between these teams
    const teamIdsInGroup = new Set(group.map(g => g.teamId));
    const matchesBetween = matches.filter(m => 
      m.homeScore !== null && 
      m.awayScore !== null && 
      teamIdsInGroup.has(m.homeTeamId) && 
      teamIdsInGroup.has(m.awayTeamId)
    );

    const N = group.length;
    const expectedMatches = N * (N - 1);

    if (matchesBetween.length === expectedMatches && expectedMatches > 0) {
      // Calculate mini-league
      const miniStandings = new Map<string, { pts: number, gd: number, gf: number }>();
      group.forEach(t => miniStandings.set(t.teamId, { pts: 0, gd: 0, gf: 0 }));
      
      matchesBetween.forEach(m => {
        const home = miniStandings.get(m.homeTeamId)!;
        const away = miniStandings.get(m.awayTeamId)!;
        home.gf += m.homeScore!;
        home.gd += (m.homeScore! - m.awayScore!);
        away.gf += m.awayScore!;
        away.gd += (m.awayScore! - m.homeScore!);
        
        if (m.homeScore! > m.awayScore!) home.pts += 3;
        else if (m.homeScore! < m.awayScore!) away.pts += 3;
        else { home.pts += 1; away.pts += 1; }
      });

      group.sort((a, b) => {
        const miniA = miniStandings.get(a.teamId)!;
        const miniB = miniStandings.get(b.teamId)!;
        if (miniB.pts !== miniA.pts) return miniB.pts - miniA.pts;
        if (miniB.gd !== miniA.gd) return miniB.gd - miniA.gd;
        if (miniB.gf !== miniA.gf) return miniB.gf - miniA.gf;
        // Fallback to general
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
      });
    } else {
      // Not all matches played, fallback to general
      group.sort((a, b) => {
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
      });
    }

    finalStandings.push(...group);
  }

  return finalStandings;
}
