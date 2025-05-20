// Keep your existing artist functionality
document.getElementById('addArtist').addEventListener('click', function() {
    const artistsContainer = document.getElementById('artistsContainer');

    const artistEntry = document.createElement('div');
    artistEntry.className = 'artist-entry';

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'artists[]';
    input.className = 'form-control';
    input.placeholder = 'Enter artist name';
    input.required = true;

    artistEntry.appendChild(input);
    artistsContainer.appendChild(artistEntry);
});

// For Artist Photos preview
document.addEventListener('DOMContentLoaded', () => {
    // For Artist Photos
    if (document.getElementById('artistPhotos')) {
        document.getElementById('artistPhotos').addEventListener('change', () => {
            const artistPhotosPaths = document.getElementById('artistPhotosPaths');
            artistPhotosPaths.innerHTML = [...document.getElementById('artistPhotos').files]
                .map(file => `<li>${file.name}</li>`).join('');
        });
    }

    // For Event Photos
    if (document.getElementById('eventPhotos')) {
        document.getElementById('eventPhotos').addEventListener('change', () => {
            const eventPhotosPreview = document.getElementById('eventPhotosPreview');
            eventPhotosPreview.innerHTML = [...document.getElementById('eventPhotos').files]
                .map(file => `<li>${file.name}</li>`).join('');
        });
    }

    // Add listener for closing success message
    document.getElementById('closeSuccessMessage').addEventListener('click', function() {
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    });
});

// Consolidated form submission logic - SINGLE event listener
document.getElementById('eventForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Date validation
    const dateInput = document.getElementById('date');
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to 00:00:00 for comparison

    if (selectedDate < today) {
        alert('Please select a valid date. You cannot select a past date.');
        return;
    }

    // Proceed with form submission if the date is valid
    const formData = new FormData(this);

    try {
        const response = await fetch('/eventForm', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            // Show success popup
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('successMessage').style.display = 'block';
            
            // Clear form inputs
            this.reset();
            
            // Clear any preview lists
            if (document.getElementById('artistPhotosPaths')) {
                document.getElementById('artistPhotosPaths').innerHTML = '';
            }
            if (document.getElementById('eventPhotosPreview')) {
                document.getElementById('eventPhotosPreview').innerHTML = '';
            }
            
            // Optional: Auto-hide success message after 5 seconds
            // setTimeout(() => {
            //     document.getElementById('successMessage').style.display = 'none';
            //     document.getElementById('overlay').style.display = 'none';
            // }, 5000);
        } else {
            alert('Error: ' + (result.message || 'Failed to create event'));
            console.error(result);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting the form');
    }
});