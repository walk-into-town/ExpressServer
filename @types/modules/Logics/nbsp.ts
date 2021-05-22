export const nbsp2plus = (query: string): string => {
    for(let i =0; i < query.length; i++){
        query = query.replace(' ', '+')
    }
    return query
}