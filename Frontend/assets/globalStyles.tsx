import {StyleSheet} from 'react-native';

export default StyleSheet.create({
    containerPadding: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        minHeight: '100%',
        maxHeight: '100%',
        height: '100%',
    },
    formElemSpacing: {
        marginTop: 10,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        textAlignVertical: 'center',
    },
    column: {
        display: 'flex',
        flexDirection: 'column'
    },
    hiddenMessage: {
        height: 0,
        paddingTop: 0,
        paddingBottom: 0
    }
});

