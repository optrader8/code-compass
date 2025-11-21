import React from 'react';
interface SearchResult {
    file: string;
    line: number;
    content: string;
}
interface SearchInterfaceProps {
    onSearch: (query: string) => Promise<void>;
    isSearching: boolean;
    searchResults: SearchResult[];
}
declare const SearchInterface: React.FC<SearchInterfaceProps>;
export default SearchInterface;
//# sourceMappingURL=SearchInterface.d.ts.map