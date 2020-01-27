import React, { PureComponent } from 'react';

import { Button, PersonFinder } from '../../src';
import UacGroupContext from '../../src/react-chayns-personfinder/component/data/uacGroups/UacGroupContext';
import SimpleWrapperContext from '../../src/react-chayns-personfinder/component/data/simpleWrapper/SimpleWrapperContext';

const customData = [
    {
        email: 'herrmann.muster@uni-muenster.de',
        displayName: 'Herrmann Muster',
        imageUrl: 'https://sub60.tobit.com/u/-1',
        shortHand: 'HM',
        firstName: 'Herrmann',
        lastName: 'Muster',
    },
    {
        email: 'max.muster@tobit.software',
        displayName: 'Max Muster',
        imageUrl: 'https://sub60.tobit.com/u/-1',
        shortHand: 'MM',
        firstName: 'Max',
        lastName: 'Muster',
    },
    {
        email: 'bill.tester@tobit.software',
        displayName: 'Bill Tester',
        imageUrl: 'https://sub60.tobit.com/u/-1',
        shortHand: 'BT',
        firstName: 'Bill',
        lastName: 'Tester',
    },
];

export default class PersonFinderExample extends PureComponent {
    static handleSelect(user) {
        chayns.dialog.alert(JSON.stringify(user, null, 2));
    }

    static handleAdd(user) {
        console.log('added', user);
    }

    static handleRemove(user) {
        console.log('removed', user);
    }

    state = { data: customData.slice(0, 1), hasMore: true }

    clear = () => {
        if (this.siteFinder) this.siteFinder.clear();
        if (this.personFinder) this.personFinder.clear();
        if (this.relationFinder) this.relationFinder.clear();
        if (this.personFinderOwn) this.personFinderOwn.clear();
    };

    render() {
        const { data, hasMore } = this.state;
        return (
            <div style={{ marginBottom: '300px' }}>
                <PersonFinder
                    ref={(ref) => { this.relationFinder = ref; }}
                    dynamic
                    placeholder="Users with reducer: show only persons with an 'e' in the name"
                    onChange={PersonFinderExample.handleSelect}
                    reducerFunction={(state) => {
                        console.log(state);
                        const newState = {
                            ...state,
                            personsRelated: state.personsRelated.filter((person) => {
                                console.log(person);
                                return person.name.indexOf('e') >= 0 || person.name.indexOf('e') >= 0;
                            }),
                            personsUnrelated: state.personsUnrelated.filter((person) => {
                                console.log(person);
                                return person.name.indexOf('e') >= 0 || person.name.indexOf('e') >= 0;
                            }),
                        };
                        return newState;
                    }}
                />
                <PersonFinder
                    defaultValue="Smith"
                    ref={(ref) => { this.relationFinder = ref; }}
                    dynamic
                    placeholder="User/Site"
                    onChange={PersonFinderExample.handleSelect}
                    showSites
                />
                <PersonFinder
                    dynamic
                    placeholder="UAC 1"
                    uacId={1}
                    onChange={PersonFinderExample.handleSelect}
                />
                <PersonFinder
                    dynamic
                    placeholder="UAC 1 Location 1"
                    uacId={1}
                    locationId={1}
                    onChange={PersonFinderExample.handleSelect}
                />
                <PersonFinder
                    ref={(ref) => { this.siteFinder = ref; }}
                    dynamic
                    placeholder="Sites"
                    defaultValue={{
                        name: 'Tobit.Software',
                        siteId: '67231-11058',
                    }}
                    onChange={PersonFinderExample.handleSelect}
                    showPersons={false}
                    showSites
                />
                <PersonFinder
                    ref={(ref) => { this.personFinder = ref; }}
                    dynamic
                    placeholder="Users"
                    onChange={PersonFinderExample.handleSelect}
                />
                <PersonFinder
                    dynamic
                    placeholder="Users (Custom)"
                    context={SimpleWrapperContext({
                        showName: 'displayName',
                        identifier: 'email',
                        search: ['email', 'displayName'],
                        imageUrl: 'imageUrl',
                    })}
                    contextProps={{
                        data,
                        hasMore,
                        onLoadMore: async () => {
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            this.setState(state => ({
                                data: customData.slice(0, state.data.length + 1),
                            }));
                        },
                        onInput: async () => {
                            this.setState({ data: [] });
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            this.setState({
                                data: customData.slice(0, 1),
                            });
                        },
                    }}
                    multiple
                    onAdd={() => this.setState({ value: '' })}
                    onRemove={PersonFinderExample.handleRemove}
                    onChange={PersonFinderExample.handleSelect}
                />
                <PersonFinder
                    dynamic
                    placeholder="UAC Groups (Custom)"
                    context={UacGroupContext}
                    multiple
                    onAdd={group => console.log('add group', group)}
                    onRemove={PersonFinderExample.handleRemove}
                    onChange={PersonFinderExample.handleSelect}
                />
                <PersonFinder
                    ref={(ref) => { this.personFinderOwn = ref; }}
                    dynamic
                    placeholder="Users (including own, showId)"
                    onChange={PersonFinderExample.handleSelect}
                    removeIcon
                    includeOwn
                    showId
                />
                <PersonFinder
                    ref={(ref) => { this.personFinderOwn = ref; }}
                    dynamic
                    placeholder="Users/Sites (multiple, dynamic)"
                    onAdd={PersonFinderExample.handleAdd}
                    onRemove={PersonFinderExample.handleRemove}
                    onChange={PersonFinderExample.handleSelect}
                    showSites
                    multiple
                />
                <PersonFinder
                    ref={(ref) => { this.personFinderOwn = ref; }}
                    dynamic
                    placeholder="Sites (multiple, default)"
                    defaultValues={[{
                        type: 'LOCATION',
                        name: 'BamBoo!',
                        siteId: '77891-25316',
                    }]}
                    onAdd={PersonFinderExample.handleAdd}
                    onRemove={PersonFinderExample.handleRemove}
                    onChange={PersonFinderExample.handleSelect}
                    showPersons={false}
                    showSites
                    multiple
                    parent={document.body}
                    boxClassName="custom-personfinder-overlay"
                />
                <PersonFinder onInput={console.log} />
                <PersonFinder placeholder="Users (multiple)" multiple />
                <Button
                    onClick={this.clear}
                >
                    {'Clear all'}
                </Button>
            </div>
        );
    }
}
