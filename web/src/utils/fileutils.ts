
export const getExt = (filename: string) => {

    const index = filename.lastIndexOf(".")
    return filename.substring(index + 1).toLowerCase()
}