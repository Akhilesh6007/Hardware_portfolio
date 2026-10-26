import { Link } from "react-router-dom";
import { PageHead } from "../components/ui/Common";
export default function NotFound() {
  return (
    <>
      <PageHead
        label="404 / OFF THE DRAWING BOARD"
        title="THIS PART DOESN’T FIT."
        description="The page you’re looking for isn’t in the lab."
      />
      <div className="container section compact">
        <Link className="button primary" to="/">
          Back to the workbench ↗
        </Link>
      </div>
    </>
  );
}
