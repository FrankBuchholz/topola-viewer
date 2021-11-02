import debounce from 'debounce';
import {analyticsEvent} from '../util/analytics';
import {buildSearchIndex, SearchIndex, SearchResult} from './search_index';
import {formatDateOrRange} from '../util/date_util';
import {IndiInfo, JsonGedcomData} from 'topola';
import {injectIntl, WrappedComponentProps} from 'react-intl';
import {JsonIndi} from 'topola';
import {Search, SearchResultProps} from 'semantic-ui-react';
import {useEffect, useRef, useState} from 'react';

function getNameLine(result: SearchResult) {
  const name = [result.indi.firstName, result.indi.lastName].join(' ').trim();
  if (result.id.length > 8) {
    return name;
  }
  return (
    <>
      {name} <i>({result.id})</i>
    </>
  );
}

interface Props {
  /** Data used for the search index. */
  data: JsonGedcomData;
  onSelection: (indiInfo: IndiInfo) => void;
}

/** Displays and handles the search box in the top bar. */
function SearchBarComponent(props: WrappedComponentProps & Props) {
  const [searchResults, setSearchResults] = useState<SearchResultProps[]>([]);
  const [searchString, setSearchString] = useState('');
  const searchIndex = useRef<SearchIndex>();

  function getDescriptionLine(indi: JsonIndi) {
    const birthDate = formatDateOrRange(indi.birth, props.intl);
    const deathDate = formatDateOrRange(indi.death, props.intl);
    if (!deathDate) {
      return birthDate;
    }
    return `${birthDate} – ${deathDate}`;
  }

  /** Produces an object that is displayed in the Semantic UI Search results. */
  function displaySearchResult(result: SearchResult): SearchResultProps {
    return {
      id: result.id,
      key: result.id,
      title: getNameLine(result),
      description: getDescriptionLine(result.indi),
    } as SearchResultProps;
  }

  /** On search input change. */
  function handleSearch(input: string | undefined) {
    if (!input) {
      return;
    }
    const results = searchIndex
      .current!.search(input)
      .map((result) => displaySearchResult(result));
    setSearchResults(results);
  }
  const debouncedHandleSearch = useRef(debounce(handleSearch, 200));

  /** On search result selected. */
  function handleResultSelect(id: string) {
    analyticsEvent('search_result_selected');
    props.onSelection({id, generation: 0});
    setSearchString('');
  }

  /** On search string changed. */
  function onChange(value: string) {
    debouncedHandleSearch.current(value);
    setSearchString(value);
  }

  // Initialize the search index.
  useEffect(() => {
    searchIndex.current = buildSearchIndex(props.data);
  }, [props.data]);

  return (
    <Search
      onSearchChange={(_, data) => onChange(data.value!)}
      onResultSelect={(_, data) => handleResultSelect(data.result.id)}
      results={searchResults}
      noResultsMessage={props.intl.formatMessage({
        id: 'menu.search.no_results',
        defaultMessage: 'No results found',
      })}
      placeholder={props.intl.formatMessage({
        id: 'menu.search.placeholder',
        defaultMessage: 'Search for people',
      })}
      selectFirstResult={true}
      value={searchString}
      id="search"
    />
  );
}
export const SearchBar = injectIntl(SearchBarComponent);
