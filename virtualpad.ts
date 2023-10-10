export namespace VirtualPad {

    export class VirtualPadMapping {
        name: string;
        indices: Array<number>;
    }

    export class VirtualPad {

        #button_value: number;
        #button_map: Map<string, Array<number>>
        #exlcusive_buttons: Map<number, number>
        axes: Array<number>
    
        constructor( num_buttons: number ) {
            this.#button_value = 0;
            this.#button_map = new Map( );
            this.#exlcusive_buttons = new Map( );
            this.axes = new Array(4);
        }

        get buttonValue( ) {
            return this.#button_value
        }

        get buttonMap( ) {
            return this.#button_map.entries( );
        }
    
        #press( button_index:number ): void {
            this.#button_value |= Math.pow(2,  Math.floor(button_index));
        }
    
        press( button_id: number | string ): void {
            if(typeof button_id == 'number') return this.#press( button_id );
            const buttons = this.#button_map.get( button_id );
            if( !buttons ) return;
            for( const button of buttons ) this.#press( button );
        }
    
        #release( button_index: number ) {
            this.#button_value &= ~Math.pow(2, Math.floor(button_index));
        }
    
        release( button_id: number | string ): void {
            if(typeof button_id == 'number') return this.#release( button_id );
            const buttons = this.#button_map.get( button_id );
            if( !buttons ) return;
            for( const button of buttons ) this.#release( button ); 
        }
    
        #isPressed( button_index: number ): boolean {
           return (this.#button_value & Math.pow(2, button_index)) != 0;
        }
    
        isPressed( button_id: number | string ): boolean {
            if( typeof button_id == 'number' ) return this.#isPressed( button_id );
            const buttons = this.#button_map.get( button_id );
            if( !buttons ) return false;
            for( const button of buttons )
                if(this.#isPressed(button)) return true;
            return false; 
        }
    
        setExclusive( button_index: number, exclude_index: number ) : void {
            this.#exlcusive_buttons.set(button_index, exclude_index);
        }
    
        mapButton( button_name: string, button_index: Array<number> ) {
            this.#button_map.set( button_name, button_index.map(index => Math.floor(index)));
        }
    
        mapGlobal( buttonMap: Array<VirtualPadMapping>) {
            for( const mapOption of buttonMap ) 
                this.mapButton( mapOption.name, mapOption.indices );
        }
    
    }

}

