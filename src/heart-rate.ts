import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

/**
 * A Heart Rate.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('heart-rate')
export class HeartRate extends LitElement {
  @state()
  private _heartRate = 0;

  @state()
  private _class = 'neutral';

  @state()
  private _arrow = '';

  render() {
    return html`
      <div>
      <button @pointerup=${this._onPointerUp} part="button" @click=${this._onHover}>
         Get My HR
      </button>
      <div class="flex">
      <h1 class="${this._class} hr">${this._heartRate}</h1>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="${this._arrow} bi bi-arrow-right" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
</svg>
</div>
       </div>
    `;
  }

  private _onHover() {
    console.log('hover');
    // setInterval(() => {
    //   const hr = Math.floor(Math.random() * 100);
    //   this._arrow = hr > this._heartRate ? 'up' : 'down';
    //   this._heartRate = hr;
    // }, 1000);
  }

  private _onPointerUp() {
    navigator.bluetooth
      .requestDevice({ filters: [{ services: ['heart_rate'] }] })
      .then((device) => {
        console.log('device', device);
        return device.gatt.connect();
      })
      .then((server) => {
        console.log('server', server);
        return server.getPrimaryService('heart_rate');
      })
      .then((service) => {
        console.log('service', service);
        //return service.getCharacteristics();
        return service.getCharacteristic('heart_rate_measurement');
      })
      .then((characteristic) => {
        console.log('characteristic', characteristic);
        return characteristic.startNotifications();
      })
      .then((characteristic) => {
        console.log('c2', characteristic);
        characteristic.addEventListener(
          'characteristicvaluechanged',
          this.handleChange
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }

  private handleChange = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value!;
    let flags = value.getUint8(0);
    let rate16Bits = flags & 0x1;
    let result = {};
    let index = 1;
    if (rate16Bits) {
      result.heartRate = value.getUint16(index, /*littleEndian=*/ true);
      index += 2;
    } else {
      result.heartRate = value.getUint8(index);
      index += 1;
    }
    this._arrow = result.heartRate > this._heartRate ? 'up' : 'down';
    this._heartRate = result.heartRate;
  };

  static styles = css`
    :host {
    }

    .hr {
      font-variant-numeric: tabular-nums; 
    }


    .flex {
      display: flex;
      align-items: center;
      gap: 1rem;
    }


    h1 {
      margin: 0;
      min-width: 3ch;
      text-align: right;
    }

    .arrow {
      fill: #fff;
    }

    .arrow-right {
      transition: rotate 1s;
    }
    .up {
      rotate: -90deg;
      transition: rotate 1s;
    }
    .down {
      rotate: 90deg;
      transition: rotate 1s;
    }


    button {
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      cursor: pointer;
      transition: border-color 0.25s;
    }
    button:hover {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }

  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'heart-rate': HeartRate;
  }
}
