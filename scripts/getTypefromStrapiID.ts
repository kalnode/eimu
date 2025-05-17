export const getTypefromStrapiID = (strapiID:string) => {
    // TODO: Do we need this? Is there a better way; just doing this for now.
    return strapiID.split('.').slice(-1)[0]
}
