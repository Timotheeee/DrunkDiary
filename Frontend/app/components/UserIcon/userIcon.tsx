import React, {ReactNode} from 'react';
import {Avatar} from 'react-native-paper';
import {StyleProp, ViewStyle} from 'react-native';

type Props = {
    name: string;
    color: string;
    style?: StyleProp<ViewStyle>;
};

export default class UserIcon extends React.Component<Props> {
    props: Props;

    /**
     * get the first 2 letters of the username
     * @return 2 characters
     * */
    getLabel(): string {
        let name = this.props.name.substring(0, 2);
        return name.toUpperCase() || '';
    }

    render(): ReactNode {
        return (
            <Avatar.Text
                size={28}
                label={this.getLabel()}
                style={[
                    {backgroundColor: this.props.color, marginRight: 5},
                    this.props.style,
                ]}
            />
        );
    }
}
