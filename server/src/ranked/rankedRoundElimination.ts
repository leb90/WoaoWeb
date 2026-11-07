export function recordRankedDeath(
    eliminated: Set<string>,
    teamMembers: readonly string[],
    id: string,
    aliveMembers: readonly string[] = [],
): boolean {
    for (const member of aliveMembers) eliminated.delete(member);
    if (!teamMembers.includes(id) || eliminated.has(id)) return false;
    eliminated.add(id);
    return teamMembers.every((member) => eliminated.has(member));
}
