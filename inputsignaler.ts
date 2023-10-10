export namespace InputSignaler {

    export const MAX_GAMEPADS = 4;

    interface KeyElement {
        current: boolean;
        previous: boolean;
    }

    interface GamepadElement {
        buttons: Array<boolean>
        axes: Array<number>
    }

    // KEYBOARD ================================================
    const keys: Map<string, KeyElement> = new Map( );

    export function enableKeyboard( ) {
        document.addEventListener('keydown', keyboardListener );
        document.addEventListener('keyup', keyboardListener );
    }

    export function disableKeyboard( ) {
        document.removeEventListener('keydown', keyboardListener );
        document.removeEventListener('keyup', keyboardListener );
    }

    function getKeyElement( name: string ) : KeyElement | undefined {
        if( !keys.has( name ) ) keys.set( name, { current: false, previous: false });
        return keys.get( name );
    }

    function keyboardListener( event:KeyboardEvent ) {
        const key = getKeyElement(event.key.toLocaleLowerCase( ));
        if( !key ) return;
        key.current = event.type == 'keydown';
    }

    function queryKeyboard( ) {
        keys.forEach((group:KeyElement, key: string) => {
            if( group.current == group.previous ) return;
            if( group.current ) {
                document.dispatchEvent(new CustomEvent('input-pressed', { detail: { src: 'keyboard',  index: key }}));
            } else {
                document.dispatchEvent(new CustomEvent('input-released', { detail: { src: 'keyboard', index: key }}));
            }
        });
    }

    // GAMEPAD ==================================================
    const gamepads = new Map<number, GamepadElement>( );

    function queryGamepads( ) {
        const query = navigator.getGamepads( );
        for( let i = 0; i < MAX_GAMEPADS; i++ ) queryGamepad( query[i], i );
    }

    function queryGamepad( gamepad: Gamepad | null, index: number ) { 
        if( gamepad && !gamepads.has(index)) connectGamepad( gamepad );
        else if(!gamepad &&  gamepads.has(index)) disconnectGamepad( index );
        else evaluateGamepad( gamepad );
    }

    function connectGamepad( gamepad: Gamepad  ) {
        gamepads.set( gamepad.index, {
            buttons: gamepad.buttons.map( x => x.pressed ),
            axes: gamepad.axes.slice( )
        });
        document.dispatchEvent(new CustomEvent('gamepad-connected', { detail: gamepad }));
    }

    function disconnectGamepad( index: number ) {
        gamepads.delete( index );
        document.dispatchEvent( new CustomEvent('gamepad-disconnected', {detail: index }));
    }

    function evaluateGamepad( gamepad ) {
        const g:GamepadElement | undefined = gamepads.get( gamepad.index )
        if(!g) return connectGamepad( gamepad );
        checkButtons( g, gamepad );
        //checkAxes( g, gamepad );
    }

    function checkButtons( g: GamepadElement, gamepad: Gamepad ) {
        for( let i = 0; i < gamepad.buttons.length; i++ ) {
            if( gamepad.buttons[i].pressed == g.buttons[i] ) continue;
            if( gamepad.buttons[i].pressed ) {
                g.buttons[i] = true;
                document.dispatchEvent(new CustomEvent('input-pressed', { detail: { src: 'gamepad:' + gamepad.index ,  index: i }}));
            } else {
                g.buttons[i] = false;
                document.dispatchEvent(new CustomEvent('input-released', { detail: { src: 'gamepad:' + gamepad.index ,  index: i }}));
            }
        }
    }

    export function update( ) {
        queryKeyboard( );
        queryGamepads( );
    }

}