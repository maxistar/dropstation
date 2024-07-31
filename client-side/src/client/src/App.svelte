<!-- src/client/src/App.svelte -->
<script>
    import { Router, Link, Route } from 'svelte-routing';
    import Index from './routes/index.svelte';
    import Settings from './routes/settings.svelte';
</script>

<main>
    <nav>
        <!--<Link to="/">Home</Link>-->
        <!--<Link to="/settings">Settings</Link>-->
    </nav>
    <Router>
        <Route path="/" component={Index} />
        <Route path="/settings" component={Settings} />
    </Router>
</main>

<style>
    nav {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    nav a {
        text-decoration: none;
        color: blue;
    }
</style>
