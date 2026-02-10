import {
  dereference,
  GedcomData,
} from '../../util/gedcom_util';
import {FormattedMessage} from 'react-intl';
import {Header, Divider, List} from 'semantic-ui-react';

export function SourceHead(gedcom: GedcomData){
/* Example:
0 HEAD
  1 SOUR Gramps
    2 VERS AIO64-6.0.6--1
    2 NAME Gramps
  1 DATE 27 JAN 2026
    2 TIME 18:55:47
  1 SUBM @SUBM@
  1 FILE C:\Users\frank\Documents\Ahnenblatt\buchholz.ged
  1 COPR Copyright (c) 2026 Frank Buchholz.
  1 GEDC
    2 VERS 5.5.1
    2 FORM LINEAGE-LINKED
  1 CHAR UTF-8
  1 LANG German
0 @SUBM@ SUBM
  1 NAME Frank Buchholz
  1 ADDR Mertzgarten 11
    2 CONT Wiesloch
    2 CONT 69168
    2 ADR1 Mertzgarten 11
    2 CITY Wiesloch
    2 POST 69168
  1 PHON 02841 16662
  1 EMAIL frank.buchholz@@web.de
*/
  const head = gedcom.head;
  /* Don't show the section if there is no relevant information */
  if (!head || !head.tree) {
    return null;
  } 

  const sour = head.tree.find((entry) => entry.tag === 'SOUR');
  const sour_name = sour && sour.tree && sour.tree.find((entry) => entry.tag === 'NAME')?.data; // Software name
  const date = head.tree.find((entry) => entry.tag === 'DATE')?.data; // Creation date
  const file = head.tree.find((entry) => entry.tag === 'FILE')?.data; // File path
  const filename = file && ( file.split('\\').pop() || file.split('/').pop() ); // Extract file name from path
  const copr = head.tree.find((entry) => entry.tag === 'COPR')?.data; // Copyright

  // Reference to submitter
  const submReference = head.tree.find((entry) => entry.tag === 'SUBM');
  const subm = submReference && dereference(submReference, gedcom, (gedcom) => gedcom.other);

  const name = subm && subm.tree && subm.tree.find((entry) => entry.tag === 'NAME')?.data; // Submitter name
  const phon = subm && subm.tree && subm.tree.find((entry) => entry.tag === 'PHON')?.data; // Phone number
  const email = subm && subm.tree && subm.tree.find((entry) => entry.tag === 'EMAIL')?.data; // Email

  const addr = subm && subm.tree && subm.tree.find((entry) => entry.tag === 'ADDR'); // Address
  const adr1 = addr && addr.tree && addr.tree.find((entry) => entry.tag === 'ADR1')?.data; // Street address
  const city = addr && addr.tree && addr.tree.find((entry) => entry.tag === 'CITY')?.data; // City
  const post = addr && addr.tree && addr.tree.find((entry) => entry.tag === 'POST')?.data; // Postal code
  const location = [adr1, post, city].filter(Boolean).join(', '); // Combined location

  /* Don't show the section if there is no relevant information */
  if (!(sour_name || date || filename || copr || name || phon || email || location)) {
    return null;
  }

  // Icons: https://react.semantic-ui.com/elements/icon/
    return (
      <>
      <Header sub>
        <FormattedMessage id="head.source" defaultMessage="Data source" />
      </Header>
      <List>
        {sour_name && (          
          <List.Item>
            <List.Icon name='edit' />
            <List.Content>{sour_name}</List.Content>
          </List.Item>
        )}
        
        {date && (
          <List.Item>
            <List.Icon name='calendar' />
            <List.Content>{date}</List.Content>
          </List.Item>
        )}
        {file && (
          <List.Item>
            <List.Icon name='file' />
            <List.Content>{filename}</List.Content>
          </List.Item>
        )}
        {name && (
          <List.Item>
            <List.Icon name='user' />
            <List.Content>{name}</List.Content>
          </List.Item>
        )}
        {adr1 && (
          <List.Item>
            <List.Icon name='marker' />
            <List.Content>{location}</List.Content>
          </List.Item>
        )}
         {phon && (
          <List.Item>
            <List.Icon name='phone' />
            <List.Content>{phon}</List.Content>
          </List.Item>
        )}
        {email && (
          <List.Item>
            <List.Icon name='mail' />
            <List.Content>{email}</List.Content>
          </List.Item>
        )}
        {copr && (
          <List.Item>
            <List.Icon name='copyright' />
            <List.Content>{copr}</List.Content>
          </List.Item>
        )}
      </List>

      <Divider />
      </>
    );
}
