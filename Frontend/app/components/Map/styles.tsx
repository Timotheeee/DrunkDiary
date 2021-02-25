import {StyleSheet} from 'react-native';

export default StyleSheet.create({
    row: {
        paddingVertical: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    message: {
        paddingLeft: 5,
    },
    newComment: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    popup: {
        height: '100%',
    },
    fabContainer: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        flexDirection: 'column',
    },
    fab: {
        flex: 1,
        backgroundColor: 'white',
        marginVertical: 4,
    },
    placeholder: {
        marginHorizontal: '2%',
        marginVertical: '4%',
        height: 210,
        width: '96%',
        backgroundColor: '#e1e1e1',
        elevation: 4,
    },
    activityIndicator: {
        flex: 1,
        marginBottom: 20,
    },
    activityIndicatorBox: {
        flex: 1,
        alignItems: 'center',
        marginVertical: '50%',
    },
    pinImage: {
        height: 200,
        alignItems: 'center',
        marginVertical: 10,
    },
});
