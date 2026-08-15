

export const getCurrentGroupLink = (groupLinks: string[], termDurationInSeconds: number) => {
    if (!Array.isArray(groupLinks) || groupLinks.length === 0 || termDurationInSeconds <= 0) {
        throw new Error("Invalid input: Provide a non-empty array of links and a positive term duration.");
    }

    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    const index = Math.floor(currentTime / termDurationInSeconds) % groupLinks.length; // Cycle through links

    return groupLinks[index]; // Return the current active group link
}