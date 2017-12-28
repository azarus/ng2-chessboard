
export class ChessboardEvent
{
	private _isPrevented = false;
	public preventDefault()
	{
		this._isPrevented = true;
	}

	public isPrevented()
	{
		return this._isPrevented;
	}
};
